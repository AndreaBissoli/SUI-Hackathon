/// Error codes for the edu_defi package
module edu_defi::errors {
    // ============ Common Errors ============
    /// Invalid amount provided
    const E_INVALID_AMOUNT: u64 = 1;
    /// Invalid percentage (must be between 0-100)
    const E_INVALID_PERCENTAGE: u64 = 2;
    /// Unauthorized operation
    const E_UNAUTHORIZED: u64 = 6;
    /// Invalid duration provided
    const E_INVALID_DURATION: u64 = 9;

    // ============ Contract Specific Errors ============
    /// Contract not found in registry
    const E_CONTRACT_NOT_FOUND: u64 = 5;
    /// Insufficient funds for operation
    const E_INSUFFICIENT_FUNDS: u64 = 8;
    /// Already claimed funds/tokens
    const E_ALREADY_CLAIMED: u64 = 10;

    // ============ Error Code Getters ============
    public(package) fun invalid_amount(): u64 { E_INVALID_AMOUNT }
    public(package) fun invalid_percentage(): u64 { E_INVALID_PERCENTAGE }
    public(package) fun unauthorized(): u64 { E_UNAUTHORIZED }
    public(package) fun invalid_duration(): u64 { E_INVALID_DURATION }
    public(package) fun contract_not_found(): u64 { E_CONTRACT_NOT_FOUND }
    public(package) fun insufficient_funds(): u64 { E_INSUFFICIENT_FUNDS }
    public(package) fun already_claimed(): u64 { E_ALREADY_CLAIMED }
}