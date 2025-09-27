'use client'
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNetworkVariable } from "./networkConfig";
import { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { isValidSuiObjectId } from "@mysten/sui/utils";

interface ContractData {
  studentAddress: string;
  investorAddress: string;
  pdfHash: string;
  fundingAmount: string;
  equityPercentage: string;
  durationMonths: string;
  isActive: boolean;
}

export function ContractLifecycle() {
  const eduDefiPackageId = useNetworkVariable("eduDefiPackageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // State management with localStorage persistence
  const [step, setStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('edudefi_current_step');
      return savedStep ? parseInt(savedStep) : 1;
    }
    return 1;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Contract creation inputs
  const [packageId, setPackageId] = useState("0x7a725cf115212bd74d2e2d9233b046f17608190e3280aad3f290a2975623a5a4");
  const [studentAddress, setStudentAddress] = useState("");
  const [pdfHash, setPdfHash] = useState("contract_pdf_hash");
  const [fundingAmount, setFundingAmount] = useState("100");
  const [equityPercentage, setEquityPercentage] = useState("20");
  const [durationMonths, setDurationMonths] = useState("24");
  
  // Contract state with localStorage persistence
  const [contractAddress, setContractAddress] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('edudefi_contract_address') || "";
    }
    return "";
  });
  const [rewardPoolAddress, setRewardPoolAddress] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('edudefi_reward_pool_address') || "";
    }
    return "";
  });
  const [dividendAmount, setDividendAmount] = useState("10");
  
  const MIST_PER_SUI = 1_000_000_000;

  // Persist state changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edudefi_current_step', step.toString());
    }
  }, [step]);

  useEffect(() => {
    if (typeof window !== 'undefined' && contractAddress) {
      localStorage.setItem('edudefi_contract_address', contractAddress);
    }
  }, [contractAddress]);

  useEffect(() => {
    if (typeof window !== 'undefined' && rewardPoolAddress) {
      localStorage.setItem('edudefi_reward_pool_address', rewardPoolAddress);
    }
  }, [rewardPoolAddress]);

  // Query contract data
  const { data: contractData, refetch: refetchContract } = useSuiClientQuery("getObject", {
    id: contractAddress,
    options: {
      showContent: true,
      showOwner: true,
    },
  }, {
    enabled: !!contractAddress && isValidSuiObjectId(contractAddress)
  });

  // Query reward pool data
  const { data: rewardPoolData, refetch: refetchRewardPool } = useSuiClientQuery("getObject", {
    id: rewardPoolAddress,
    options: {
      showContent: true,
      showOwner: true,
    },
  }, {
    enabled: !!rewardPoolAddress && isValidSuiObjectId(rewardPoolAddress)
  });

  const resetState = () => {
    setStep(1);
    setError(null);
    setSuccess(null);
    setContractAddress("");
    setRewardPoolAddress("");
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('edudefi_current_step');
      localStorage.removeItem('edudefi_contract_address');
      localStorage.removeItem('edudefi_reward_pool_address');
    }
  };

  const handleError = (err: any, context: string) => {
    console.error(`${context}:`, err);
    setError(`${context}: ${err.message || 'Unknown error'}`);
    setLoading(false);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Step 1: Create Contract
  const createContract = async () => {
    if (!packageId || !studentAddress) {
      setError("Please enter the package ID and student address");
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      const tx = new Transaction();

      // Create contract - use system clock (0x6 is the system clock object)
      tx.moveCall({
        target: `${packageId}::contract::create_and_share_contract`,
        arguments: [
          tx.pure.address(studentAddress),
          tx.pure.string(pdfHash),
          tx.pure.u64(parseInt(fundingAmount) * MIST_PER_SUI),
          tx.pure.u64(30), // 30 days release interval
          tx.pure.u64(parseInt(equityPercentage)),
          tx.pure.u64(parseInt(durationMonths)),
          tx.object('0x6'), // System clock
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            suiClient.waitForTransaction({ 
              digest,
              options: {
                showEffects: true,
                showObjectChanges: true,
              },
            }).then(async (result) => {
              const { effects, objectChanges } = result;

              console.log("Transaction result:", result);
              console.log("Object changes:", objectChanges);
              console.log("Effects:", effects);

              // Find the created contract - try multiple matching strategies
              let createdContract = objectChanges?.find(
                (change) => change.type === 'created' && 
                change.objectType.includes('::Contract')
              );

              // If not found, try looking for any created object from our package
              if (!createdContract) {
                createdContract = objectChanges?.find(
                  (change) => change.type === 'created' && 
                  change.objectType.includes(packageId)
                );
              }

              // If still not found, try the first created object (might be the contract)
              if (!createdContract) {
                createdContract = objectChanges?.find(
                  (change) => change.type === 'created'
                );
              }

              if (createdContract && 'objectId' in createdContract) {
                console.log("Found created contract:", createdContract);
                setContractAddress(createdContract.objectId);
                setSuccess("Contract created successfully!");
                setStep(2);
              } else {
                console.log("No contract found in object changes:", objectChanges);
                setError("Contract creation failed - no contract found in transaction. Check console for details.");
              }
              setLoading(false);
            });
          },
          onError: (err) => handleError(err, "Contract creation failed"),
        }
      );
    } catch (err) {
      handleError(err, "Contract creation failed");
    }
  };

  // Step 2: Accept Contract (as Student)
  const acceptContract = async () => {
    if (!contractAddress) return;

    clearMessages();
    setLoading(true);

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${packageId}::contract::accept_contract`,
        arguments: [
          tx.object(contractAddress),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            suiClient.waitForTransaction({ 
              digest: result.digest,
              options: {
                showEffects: true,
                showObjectChanges: true,
              },
            }).then(async () => {
              await refetchContract();
              setSuccess("Contract accepted successfully!");
              setStep(3);
              setLoading(false);
            });
          },
          onError: (err) => handleError(err, "Contract acceptance failed"),
        }
      );
    } catch (err) {
      handleError(err, "Contract acceptance failed");
    }
  };

  // Step 3: Fund Contract (as Investor)
  const fundContract = async () => {
    if (!contractAddress) return;

    clearMessages();
    setLoading(true);

    try {
      const tx = new Transaction();
      
      // Create payment coin
      const [coin] = tx.splitCoins(tx.gas, [
        tx.pure.u64(parseInt(fundingAmount) * MIST_PER_SUI),
      ]);

      tx.moveCall({
        target: `${packageId}::contract::fund_contract_with_tokens`,
        arguments: [
          tx.object(contractAddress),
          coin,
          tx.object('0x6'), // System clock
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            suiClient.waitForTransaction({ 
              digest: result.digest,
              options: {
                showObjectChanges: true,
              },
            }).then(async (txResult) => {
              const { objectChanges } = txResult;

              console.log("Fund contract - Object changes:", objectChanges);

              // Find the created reward pool - try multiple strategies
              let createdPool = objectChanges?.find(
                (change) => change.type === 'created' && 
                change.objectType.includes('::RewardPool')
              );

              // If not found, try looking for any new shared object
              if (!createdPool) {
                createdPool = objectChanges?.find(
                  (change) => change.type === 'created' && 
                  change.objectType.includes(packageId)
                );
              }

              if (createdPool && 'objectId' in createdPool) {
                console.log("Found created reward pool:", createdPool);
                setRewardPoolAddress(createdPool.objectId);
              } else {
                console.log("No reward pool found, continuing without it");
              }

              await refetchContract();
              setSuccess("Contract funded and tokens issued!");
              setStep(4);
              setLoading(false);
            });
          },
          onError: (err) => handleError(err, "Contract funding failed"),
        }
      );
    } catch (err) {
      handleError(err, "Contract funding failed");
    }
  };

  // Step 4: Pay Dividend (as Student)
  const payDividend = async () => {
    if (!contractAddress || !rewardPoolAddress) return;

    clearMessages();
    setLoading(true);

    try {
      const tx = new Transaction();
      
      // Create payment coin
      const [coin] = tx.splitCoins(tx.gas, [
        tx.pure.u64(parseInt(dividendAmount) * MIST_PER_SUI),
      ]);

      tx.moveCall({
        target: `${packageId}::contract::pay_monthly_dividend`,
        arguments: [
          tx.object(contractAddress),
          tx.object(rewardPoolAddress),
          coin,
          tx.object('0x6'), // System clock
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            suiClient.waitForTransaction({ 
              digest: result.digest,
              options: {
                showEffects: true,
                showObjectChanges: true,
              },
            }).then(async () => {
              await refetchRewardPool();
              setSuccess("Dividend paid successfully!");
              setStep(5);
              setLoading(false);
            });
          },
          onError: (err) => handleError(err, "Dividend payment failed"),
        }
      );
    } catch (err) {
      handleError(err, "Dividend payment failed");
    }
  };

  // Step 5: Claim Dividend (as Investor)
  const claimDividend = async () => {
    if (!rewardPoolAddress) return;

    clearMessages();
    setLoading(true);

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${packageId}::contract::claim_dividend_payment`,
        arguments: [
          tx.object(rewardPoolAddress),
          tx.pure.u64(0), // first dividend payment
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            suiClient.waitForTransaction({ 
              digest: result.digest,
              options: {
                showEffects: true,
                showObjectChanges: true,
              },
            }).then(async () => {
              await refetchRewardPool();
              setSuccess("Dividend claimed successfully!");
              setStep(6);
              setLoading(false);
            });
          },
          onError: (err) => handleError(err, "Dividend claim failed"),
        }
      );
    } catch (err) {
      handleError(err, "Dividend claim failed");
    }
  };

  const getContractFields = (data: any) => {
    if (data?.data?.content?.dataType !== "moveObject") return null;
    return data.data.content.fields;
  };

  const getRewardPoolFields = (data: any) => {
    if (data?.data?.content?.dataType !== "moveObject") return null;
    return data.data.content.fields;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Contract Lifecycle Demo</h2>
        <p className="text-gray-600">
          Follow the complete flow from contract creation to dividend distribution
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= num
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Action Panel */}
        <Card>
          <CardHeader>
            <CardTitle>
              Step {step}: {
                step === 1 ? "Create Contract (Investor)" :
                step === 2 ? "Accept Contract (Student)" :
                step === 3 ? "Fund Contract (Investor)" :
                step === 4 ? "Pay Dividend (Student)" :
                step === 5 ? "Claim Dividend (Investor)" :
                "Complete!"
              }
            </CardTitle>
            <CardDescription>
              {
                step === 1 ? "Create a new contract with specified terms" :
                step === 2 ? "Student accepts the contract terms" :
                step === 3 ? "Investor funds the contract and receives tokens" :
                step === 4 ? "Student pays monthly dividend to token holders" :
                step === 5 ? "Investor claims their dividend payment" :
                "All steps completed successfully!"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Package ID *</label>
                  <Input
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    placeholder="0x..."
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Student Address *</label>
                  <Input
                    value={studentAddress}
                    onChange={(e) => setStudentAddress(e.target.value)}
                    placeholder="Enter student's wallet address"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the wallet address of the student who will receive funding
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PDF Hash</label>
                  <Input
                    value={pdfHash}
                    onChange={(e) => setPdfHash(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Funding (SUI)</label>
                    <Input
                      type="number"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Equity %</label>
                    <Input
                      type="number"
                      value={equityPercentage}
                      onChange={(e) => setEquityPercentage(e.target.value)}
                      max="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (Months)</label>
                  <Input
                    type="number"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                  />
                </div>
                <Button
                  onClick={createContract}
                  disabled={loading || !packageId || !studentAddress}
                  className="w-full"
                >
                  {loading ? <ClipLoader size={20} color="white" /> : "Create Contract"}
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Make sure your wallet is connected to the student address: <br/>
                    <code className="break-all">{studentAddress}</code><br/>
                    If not, please switch accounts in your wallet extension.
                  </p>
                </div>
                <Button
                  onClick={acceptContract}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <ClipLoader size={20} color="white" /> : "Accept Contract"}
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Make sure your wallet is connected to the investor address (contract creator).<br/>
                    If not, please switch accounts in your wallet extension to the address that created the contract.
                  </p>
                </div>
                <Button
                  onClick={fundContract}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <ClipLoader size={20} color="white" /> : "Fund Contract & Issue Tokens"}
                </Button>
              </>
            )}

            {step === 4 && (
              <>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Note:</strong> Switch to the student address in your wallet: <br/>
                    <code className="break-all">{studentAddress}</code><br/>
                    Use your wallet extension to switch accounts.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dividend Amount (SUI)</label>
                  <Input
                    type="number"
                    value={dividendAmount}
                    onChange={(e) => setDividendAmount(e.target.value)}
                  />
                </div>
                <Button
                  onClick={payDividend}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <ClipLoader size={20} color="white" /> : "Pay Monthly Dividend"}
                </Button>
              </>
            )}

            {step === 5 && (
              <>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Note:</strong> Switch back to the investor address (contract creator) in your wallet.<br/>
                    Use your wallet extension to switch to the account that created and funded the contract.
                  </p>
                </div>
                <Button
                  onClick={claimDividend}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <ClipLoader size={20} color="white" /> : "Claim Dividend"}
                </Button>
              </>
            )}

            {step === 6 && (
              <div className="text-center space-y-4">
                <div className="text-6xl">🎉</div>
                <h3 className="text-xl font-semibold text-green-600">
                  Contract Lifecycle Complete!
                </h3>
                <p className="text-gray-600">
                  You've successfully completed all steps of the contract lifecycle.
                </p>
                <Button onClick={resetState} variant="outline" className="w-full">
                  Start New Demo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contractAddress && (
              <div>
                <label className="block text-sm font-medium mb-1">Contract Address</label>
                <div className="p-2 bg-gray-50 rounded text-sm font-mono break-all">
                  {contractAddress}
                </div>
              </div>
            )}

            {rewardPoolAddress && (
              <div>
                <label className="block text-sm font-medium mb-1">Reward Pool Address</label>
                <div className="p-2 bg-gray-50 rounded text-sm font-mono break-all">
                  {rewardPoolAddress}
                </div>
              </div>
            )}

            {contractData && getContractFields(contractData) && (
              <div>
                <label className="block text-sm font-medium mb-1">Contract Status</label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Active:</span>
                    <span className={getContractFields(contractData).is_active ? 'text-green-600' : 'text-red-600'}>
                      {getContractFields(contractData).is_active ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Funding:</span>
                    <span>{(parseInt(getContractFields(contractData).funding_amount) / MIST_PER_SUI).toFixed(2)} SUI</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equity:</span>
                    <span>{getContractFields(contractData).equity_percentage}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Current Account</h4>
              <p className="text-xs text-blue-800 font-mono break-all">
                {currentAccount?.address}
              </p>
              <div className="mt-2 text-xs">
                <span className="font-medium text-blue-900">Expected Role: </span>
                <span className={`px-2 py-1 rounded ${
                  step === 1 || step === 3 || step === 5 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {step === 1 || step === 3 || step === 5 ? 'Investor' : 'Student'}
                </span>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">🔄 Account Switching</h4>
              <p className="text-xs text-green-800 mb-2">
                To switch accounts for different roles:
              </p>
              <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
                <li>Click disconnect in your wallet</li>
                <li>Connect with the required account</li>
                <li>Your progress is saved automatically!</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Demo Steps</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Create contract (investor)</li>
                <li>Accept contract (student)</li>
                <li>Fund & issue tokens (investor)</li>
                <li>Pay dividend (student)</li>
                <li>Claim dividend (investor)</li>
                <li>Complete! 🎉</li>
              </ol>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">🔄 Role Information</h4>
              <p className="text-sm text-orange-800 mb-2">
                For this demo, you have 2 roles:
              </p>
              <ul className="text-xs text-orange-700 space-y-1">
                <li><strong>Investor (You):</strong> Current wallet - creates and funds contracts</li>
                <li><strong>Student:</strong> Target address - accepts contracts and pays dividends</li>
              </ul>
              <p className="text-xs text-orange-700 mt-2">
                You'll need to switch to the student's wallet for steps 2 & 4.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}