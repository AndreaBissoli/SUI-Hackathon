#[test_only]
module edu_defi::investor_tests {
    use edu_defi::investor;
    use sui::test_scenario::{Self, Scenario};
    use sui::clock::{Self, Clock};
    use std::string;

    // ============ Test Constants ============
    const INVESTOR_ADDR: address = @0xB;
    const ADMIN_ADDR: address = @0xAD;

    // ============ Helper Functions ============
    
    fun create_test_clock(scenario: &mut Scenario): Clock {
        clock::create_for_testing(test_scenario::ctx(scenario))
    }

    // ============ Unit Tests ============

    #[test]
    fun test_create_investor_profile() {
        let mut scenario = test_scenario::begin(INVESTOR_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create investor profile
        let investor = investor::create_profile(
            string::utf8(b"Anna"),
            string::utf8(b"Verdi"),
            35,
            string::utf8(b"investor_img_url"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Test investor info
        let (name, surname, age, profile_image) = investor::get_info(&investor);
        
        assert!(name == string::utf8(b"Anna"), 0);
        assert!(surname == string::utf8(b"Verdi"), 1);
        assert!(age == 35, 2);
        assert!(profile_image == string::utf8(b"investor_img_url"), 3);

        // Test address generation
        let _investor_address = investor::get_address(&investor);
        
        // Clean up
        sui::test_utils::destroy(investor);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_update_investor_profile() {
        let mut scenario = test_scenario::begin(INVESTOR_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create investor profile
        let mut investor = investor::create_profile(
            string::utf8(b"Anna"),
            string::utf8(b"Verdi"),
            35,
            string::utf8(b"investor_img_url"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Update investor profile
        investor::update_profile(
            &mut investor,
            string::utf8(b"Sofia"),
            string::utf8(b"Neri"),
            40,
            string::utf8(b"new_investor_img"),
            test_scenario::ctx(&mut scenario)
        );

        // Verify updates
        let (name, surname, age, profile_image) = investor::get_info(&investor);
        
        assert!(name == string::utf8(b"Sofia"), 0);
        assert!(surname == string::utf8(b"Neri"), 1);
        assert!(age == 40, 2);
        assert!(profile_image == string::utf8(b"new_investor_img"), 3);

        // Clean up
        sui::test_utils::destroy(investor);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_update_investor_unauthorized() {
        let mut scenario = test_scenario::begin(INVESTOR_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create investor profile
        let mut investor = investor::create_profile(
            string::utf8(b"Anna"),
            string::utf8(b"Verdi"),
            35,
            string::utf8(b"investor_img_url"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Switch to different user and try to update (should fail)
        test_scenario::next_tx(&mut scenario, ADMIN_ADDR);
        
        investor::update_profile(
            &mut investor,
            string::utf8(b"Sofia"),
            string::utf8(b"Neri"),
            40,
            string::utf8(b"new_investor_img"),
            test_scenario::ctx(&mut scenario)
        );

        // This should never execute due to the abort above
        sui::test_utils::destroy(investor);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_multiple_investors() {
        let mut scenario = test_scenario::begin(INVESTOR_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create multiple investor profiles
        let investor1 = investor::create_profile(
            string::utf8(b"Anna"),
            string::utf8(b"Verdi"),
            35,
            string::utf8(b"investor1_img"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        let investor2 = investor::create_profile(
            string::utf8(b"Marco"),
            string::utf8(b"Blu"),
            42,
            string::utf8(b"investor2_img"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Test both investors have different addresses
        let addr1 = investor::get_address(&investor1);
        let addr2 = investor::get_address(&investor2);
        assert!(addr1 != addr2, 0);

        // Test investor1 info
        let (name1, surname1, age1, profile_image1) = investor::get_info(&investor1);
        assert!(name1 == string::utf8(b"Anna"), 1);
        assert!(surname1 == string::utf8(b"Verdi"), 2);
        assert!(age1 == 35, 3);
        assert!(profile_image1 == string::utf8(b"investor1_img"), 4);

        // Test investor2 info
        let (name2, surname2, age2, profile_image2) = investor::get_info(&investor2);
        assert!(name2 == string::utf8(b"Marco"), 5);
        assert!(surname2 == string::utf8(b"Blu"), 6);
        assert!(age2 == 42, 7);
        assert!(profile_image2 == string::utf8(b"investor2_img"), 8);

        // Clean up
        sui::test_utils::destroy(investor1);
        sui::test_utils::destroy(investor2);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
