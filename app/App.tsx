'use client'
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContractLifecycle } from "./ContractLifecycle";

function App() {
  const currentAccount = useCurrentAccount();
  const [view, setView] = useState<'main' | 'lifecycle'>('main');

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="min-h-[600px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            EduDeFi - Educational DeFi Contract Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentAccount ? (
            view === 'main' ? (
              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-gray-600 mb-8">
                    Simulate the complete contract lifecycle between students and investors
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                          onClick={() => setView('lifecycle')}>
                      <div className="text-center space-y-4">
                        <div className="text-4xl">📋</div>
                        <h3 className="text-xl font-semibold">Contract Lifecycle Demo</h3>
                        <p className="text-gray-600 text-sm">
                          Experience the complete flow from contract creation to dividend distribution
                        </p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Start Demo
                        </Button>
                      </div>
                    </Card>
                    
                    <Card className="p-6 opacity-75">
                      <div className="text-center space-y-4">
                        <div className="text-4xl">📊</div>
                        <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
                        <p className="text-gray-600 text-sm">
                          View contract performance and dividend history
                        </p>
                        <Button disabled className="w-full">
                          Coming Soon
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Connected Account</h4>
                  <p className="text-sm text-gray-600 break-all">{currentAccount.address}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button 
                    onClick={() => setView('main')}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    ← Back to Main
                  </Button>
                </div>
                <ContractLifecycle />
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to EduDeFi</h2>
              <p className="text-gray-600">Please connect your wallet to get started</p>
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What is EduDeFi?</h3>
                <p className="text-blue-800 text-sm">
                  A decentralized platform connecting students with investors. Students receive funding 
                  for education in exchange for future income sharing through tokenized equity and smart dividends.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
