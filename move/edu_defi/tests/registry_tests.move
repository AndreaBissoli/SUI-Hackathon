#[test_only]
module edu_defi::registry_tests {
    use edu_defi::edu_defi;
    use sui::test_scenario::{Self, Scenario};
    use sui::clock::{Self, Clock};
    use std::string;

    // ============ Test Constants ============
    const STUDENT_ADDR: address = @0xA;
    const INVESTOR_ADDR: address = @0xB;
    const ADMIN_ADDR: address = @0xAD;

    // ============ Helper Functions ============
    
    fun create_test_clock(scenario: &mut Scenario): Clock {
        clock::create_for_testing(test_scenario::ctx(scenario))
    }

    // ============ Unit Tests ============

    #[test]
    fun test_service_registry_initialization() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        
        // Create a registry for testing
        let registry = edu_defi::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        
        // Check initial stats
        let (students_count, investors_count, contracts_count) = edu_defi::get_registry_stats(&registry);
        assert!(students_count == 0, 0);
        assert!(investors_count == 0, 1);
        assert!(contracts_count == 0, 2);
        
        sui::test_utils::destroy(registry);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_student_registration_workflow() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create a ServiceRegistry for testing
        let mut registry = edu_defi::create_registry_for_testing(test_scenario::ctx(&mut scenario));

        // Switch to student and create profile
        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        
        edu_defi::student_create_profile(
            string::utf8(b"Mario"),
            string::utf8(b"Rossi"),
            25,
            string::utf8(b"cv_hash_123"),
            string::utf8(b"profile_img_url"),
            100000,
            20,
            24,
            &mut registry,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Verify student was added to registry
        let (students_count, _, _) = edu_defi::get_registry_stats(&registry);
        assert!(students_count == 1, 0);
        
        // Clean up
        sui::test_utils::destroy(registry);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_investor_registration_workflow() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create a ServiceRegistry for testing
        let mut registry = edu_defi::create_registry_for_testing(test_scenario::ctx(&mut scenario));

        // Switch to investor and create profile
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        
        edu_defi::investor_create_profile(
            string::utf8(b"Anna"),
            string::utf8(b"Verdi"),
            35,
            string::utf8(b"investor_img_url"),
            &mut registry,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Verify investor was added to registry
        let (_, investors_count, _) = edu_defi::get_registry_stats(&registry);
        assert!(investors_count == 1, 0);
        
        // Clean up
        sui::test_utils::destroy(registry);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_contract_proposal_workflow() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create a ServiceRegistry for testing
        let mut registry = edu_defi::create_registry_for_testing(test_scenario::ctx(&mut scenario));

        // Switch to investor and propose contract
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        
        edu_defi::investor_propose_contract(
            STUDENT_ADDR, // student address
            string::utf8(b"contract_pdf_hash"),
            100000, // funding amount
            30, // release interval days
            20, // equity percentage
            24, // duration months
            &mut registry,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Verify contract was added to registry
        let (_, _, contracts_count) = edu_defi::get_registry_stats(&registry);
        assert!(contracts_count == 1, 0);
        
        // Clean up
        sui::test_utils::destroy(registry);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_full_registration_workflow() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create a ServiceRegistry for testing
        let mut registry = edu_defi::create_registry_for_testing(test_scenario::ctx(&mut scenario));

        // Step 1: Register student
        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        edu_defi::student_create_profile(
            string::utf8(b"Mario"),
            string::utf8(b"Rossi"),
            25,
            string::utf8(b"cv_hash_123"),
            string::utf8(b"profile_img_url"),
            100000,
            20,
            24,
            &mut registry,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Step 2: Register investor
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        edu_defi::investor_create_profile(
            string::utf8(b"Anna"),
            string::utf8(b"Verdi"),
            35,
            string::utf8(b"investor_img_url"),
            &mut registry,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Step 3: Investor proposes contract
        edu_defi::investor_propose_contract(
            STUDENT_ADDR,
            string::utf8(b"contract_pdf_hash"),
            100000,
            30,
            20,
            24,
            &mut registry,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Verify all registrations
        let (students_count, investors_count, contracts_count) = edu_defi::get_registry_stats(&registry);
        assert!(students_count == 1, 0);
        assert!(investors_count == 1, 1);
        assert!(contracts_count == 1, 2);
        
        // Clean up
        sui::test_utils::destroy(registry);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_registry_helpers() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);

        // Create a ServiceRegistry for testing
        let mut registry = edu_defi::create_registry_for_testing(test_scenario::ctx(&mut scenario));

        // Test initial state
        let (students_count, investors_count, contracts_count) = edu_defi::get_registry_stats(&registry);
        assert!(students_count == 0, 0);
        assert!(investors_count == 0, 1);
        assert!(contracts_count == 0, 2);

        // Test add_student
        edu_defi::add_student(&mut registry, STUDENT_ADDR);
        let (students_count, _, _) = edu_defi::get_registry_stats(&registry);
        assert!(students_count == 1, 3);
        
        // Test add_investor
        edu_defi::add_investor(&mut registry, INVESTOR_ADDR);
        let (_, investors_count, _) = edu_defi::get_registry_stats(&registry);
        assert!(investors_count == 1, 4);
        
        // Test add_contract
        edu_defi::add_contract(&mut registry, @0xC);
        let (_, _, contracts_count) = edu_defi::get_registry_stats(&registry);
        assert!(contracts_count == 1, 5);

        // Final verification
        let (final_students, final_investors, final_contracts) = edu_defi::get_registry_stats(&registry);
        assert!(final_students == 1, 6);
        assert!(final_investors == 1, 7);
        assert!(final_contracts == 1, 8);
        
        // Clean up
        sui::test_utils::destroy(registry); 
        test_scenario::end(scenario);
    }
}
