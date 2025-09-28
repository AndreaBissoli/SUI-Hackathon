#[test_only]
module edu_defi::remove_contract_tests {
    use edu_defi::edu_defi::{Self, ServiceRegistry};
    use sui::test_scenario::{Self, Scenario};

    // ============ Test Constants ============
    const STUDENT_ADDR: address = @0xA;
    const INVESTOR_ADDR: address = @0xB;
    const ADMIN_ADDR: address = @0xAD;
    const STUDENT2_ADDR: address = @0xC;

    // ============ Unit Tests ============

    #[test]
    fun test_remove_contract_basic() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        
        // Create a registry for testing
        let mut registry = edu_defi::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        
        // Mock contract address
        let contract_address = @0x123;
        
        // Add contract to registry manually
        edu_defi::add_contract_to_registry_for_testing(&mut registry, contract_address, STUDENT_ADDR, INVESTOR_ADDR);
        
        // Verify contract exists before removal
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract_address, STUDENT_ADDR), 0);
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract_address, INVESTOR_ADDR), 1);
        
        // Call the remove_contract function through public interface
        edu_defi::test_remove_contract(&mut registry, contract_address, STUDENT_ADDR, INVESTOR_ADDR);
        
        // Verify contract was removed
        assert!(!edu_defi::contract_exists_in_registry_for_testing(&registry, contract_address, STUDENT_ADDR), 2);
        assert!(!edu_defi::contract_exists_in_registry_for_testing(&registry, contract_address, INVESTOR_ADDR), 3);
        
        // Clean up
        sui::test_utils::destroy(registry);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_remove_contract_multiple_contracts() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        
        // Create a registry for testing
        let mut registry = edu_defi::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        
        // Mock contract addresses
        let contract1_address = @0x123;
        let contract2_address = @0x456;
        let contract3_address = @0x789;
        
        // Add multiple contracts to the same student and investor
        edu_defi::add_contract_to_registry_for_testing(&mut registry, contract1_address, STUDENT_ADDR, INVESTOR_ADDR);
        edu_defi::add_contract_to_registry_for_testing(&mut registry, contract2_address, STUDENT_ADDR, INVESTOR_ADDR);
        edu_defi::add_contract_to_registry_for_testing(&mut registry, contract3_address, STUDENT_ADDR, INVESTOR_ADDR);
        
        // Verify all contracts exist
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract1_address, STUDENT_ADDR), 0);
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract2_address, STUDENT_ADDR), 1);
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract3_address, STUDENT_ADDR), 2);
        
        // Remove middle contract
        edu_defi::test_remove_contract(&mut registry, contract2_address, STUDENT_ADDR, INVESTOR_ADDR);
        
        // Verify only contract2 was removed
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract1_address, STUDENT_ADDR), 3);
        assert!(!edu_defi::contract_exists_in_registry_for_testing(&registry, contract2_address, STUDENT_ADDR), 4);
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract3_address, STUDENT_ADDR), 5);
        
        // Remove remaining contracts
        edu_defi::test_remove_contract(&mut registry, contract1_address, STUDENT_ADDR, INVESTOR_ADDR);
        edu_defi::test_remove_contract(&mut registry, contract3_address, STUDENT_ADDR, INVESTOR_ADDR);
        
        // Verify all contracts are removed
        assert!(!edu_defi::contract_exists_in_registry_for_testing(&registry, contract1_address, STUDENT_ADDR), 6);
        assert!(!edu_defi::contract_exists_in_registry_for_testing(&registry, contract2_address, STUDENT_ADDR), 7);
        assert!(!edu_defi::contract_exists_in_registry_for_testing(&registry, contract3_address, STUDENT_ADDR), 8);
        
        // Clean up
        sui::test_utils::destroy(registry);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_remove_contract_different_users() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        
        // Create a registry for testing
        let mut registry = edu_defi::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        
        // Mock contract addresses
        let contract1_address = @0x123;  // STUDENT_ADDR <-> INVESTOR_ADDR
        let contract2_address = @0x456;  // STUDENT2_ADDR <-> INVESTOR_ADDR
        
        // Add contracts between different pairs
        edu_defi::add_contract_to_registry_for_testing(&mut registry, contract1_address, STUDENT_ADDR, INVESTOR_ADDR);
        edu_defi::add_contract_to_registry_for_testing(&mut registry, contract2_address, STUDENT2_ADDR, INVESTOR_ADDR);
        
        // Verify both contracts exist
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract1_address, STUDENT_ADDR), 0);
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract1_address, INVESTOR_ADDR), 1);
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract2_address, STUDENT2_ADDR), 2);
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract2_address, INVESTOR_ADDR), 3);
        
        // Remove first contract
        edu_defi::test_remove_contract(&mut registry, contract1_address, STUDENT_ADDR, INVESTOR_ADDR);
        
        // Verify only contract1 was removed, contract2 still exists
        assert!(!edu_defi::contract_exists_in_registry_for_testing(&registry, contract1_address, STUDENT_ADDR), 4);
        assert!(!edu_defi::contract_exists_in_registry_for_testing(&registry, contract1_address, INVESTOR_ADDR), 5);
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract2_address, STUDENT2_ADDR), 6);
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, contract2_address, INVESTOR_ADDR), 7);
        
        // Clean up
        sui::test_utils::destroy(registry);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_remove_nonexistent_contract() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        
        // Create a registry for testing
        let mut registry = edu_defi::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        
        // Mock contract addresses
        let existing_contract = @0x123;
        let nonexistent_contract = @0x456;
        
        // Add only one contract
        edu_defi::add_contract_to_registry_for_testing(&mut registry, existing_contract, STUDENT_ADDR, INVESTOR_ADDR);
        
        // Try to remove non-existent contract (should not crash)
        edu_defi::test_remove_contract(&mut registry, nonexistent_contract, STUDENT_ADDR, INVESTOR_ADDR);
        
        // Verify existing contract is still there
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, existing_contract, STUDENT_ADDR), 0);
        assert!(edu_defi::contract_exists_in_registry_for_testing(&registry, existing_contract, INVESTOR_ADDR), 1);
        
        // Clean up
        sui::test_utils::destroy(registry);
        test_scenario::end(scenario);
    }
}
