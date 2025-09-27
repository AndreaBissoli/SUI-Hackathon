#[test_only]
module edu_defi::student_tests {
    use edu_defi::student;
    use sui::test_scenario::{Self, Scenario};
    use sui::clock::{Self, Clock};
    use sui::test_utils;
    use std::string;

    // ============ Test Constants ============
    const STUDENT_ADDR: address = @0xA;
    const ADMIN_ADDR: address = @0xAD;

    // ============ Helper Functions ============
    
    fun create_test_clock(scenario: &mut Scenario): Clock {
        clock::create_for_testing(test_scenario::ctx(scenario))
    }

    // ============ Unit Tests ============

    #[test]
    fun test_create_student_profile() {
        let mut scenario = test_scenario::begin(STUDENT_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create student profile
        let student = student::create_profile(
            string::utf8(b"Mario"),
            string::utf8(b"Rossi"),
            25,
            string::utf8(b"cv_hash_123"),
            string::utf8(b"profile_img_url"),
            100000,
            20,
            24,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Test student info
        let (name, surname, age, cv_hash, funding_requested, equity_percentage, duration_months) = 
            student::get_info(&student);
        
        assert!(name == string::utf8(b"Mario"), 0);
        assert!(surname == string::utf8(b"Rossi"), 1);
        assert!(age == 25, 2);
        assert!(cv_hash == string::utf8(b"cv_hash_123"), 3);
        assert!(funding_requested == 100000, 4);
        assert!(equity_percentage == 20, 5);
        assert!(duration_months == 24, 6);

        // Test address generation
        let _student_address = student::get_address(&student);
        
        // Clean up - destroy object created in test
        sui::test_utils::destroy(student);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_update_student_profile() {
        let mut scenario = test_scenario::begin(STUDENT_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create student profile
        let mut student = student::create_profile(
            string::utf8(b"Mario"),
            string::utf8(b"Rossi"),
            25,
            string::utf8(b"cv_hash_123"),
            string::utf8(b"profile_img_url"),
            100000,
            20,
            24,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Update student profile
        student::update_profile(
            &mut student,
            string::utf8(b"Luigi"),
            string::utf8(b"Bianchi"),
            30,
            string::utf8(b"new_cv_hash"),
            string::utf8(b"new_profile_img"),
            150000,
            25,
            36,
            test_scenario::ctx(&mut scenario)
        );

        // Verify updates
        let (name, surname, age, cv_hash, funding_requested, equity_percentage, duration_months) = 
            student::get_info(&student);
        
        assert!(name == string::utf8(b"Luigi"), 0);
        assert!(surname == string::utf8(b"Bianchi"), 1);
        assert!(age == 30, 2);
        assert!(cv_hash == string::utf8(b"new_cv_hash"), 3);
        assert!(funding_requested == 150000, 4);
        assert!(equity_percentage == 25, 5);
        assert!(duration_months == 36, 6);

        // Clean up - destroy object created in test
        sui::test_utils::destroy(student);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_create_student_invalid_percentage() {
        let mut scenario = test_scenario::begin(STUDENT_ADDR);
        let clock = create_test_clock(&mut scenario);
        let ctx = test_scenario::ctx(&mut scenario);

        // Try to create student with invalid percentage (> 100) - should abort
        let student = student::create_profile(
            string::utf8(b"Mario"),
            string::utf8(b"Rossi"),
            25,
            string::utf8(b"cv_hash_123"),
            string::utf8(b"profile_img_url"),
            100000,
            150, // Invalid: > 100
            24,
            &clock,
            ctx
        );

        // This should never execute due to the abort above
        test_utils::destroy(student);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_create_student_invalid_funding() {
        let mut scenario = test_scenario::begin(STUDENT_ADDR);
        let clock = create_test_clock(&mut scenario);
        let ctx = test_scenario::ctx(&mut scenario);

        // Try to create student with invalid funding amount (0) - should abort
        let student = student::create_profile(
            string::utf8(b"Mario"),
            string::utf8(b"Rossi"),
            25,
            string::utf8(b"cv_hash_123"),
            string::utf8(b"profile_img_url"),
            0, // Invalid: must be > 0
            20,
            24,
            &clock,
            ctx
        );

        // This should never execute due to the abort above
        test_utils::destroy(student);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_create_student_invalid_duration() {
        let mut scenario = test_scenario::begin(STUDENT_ADDR);
        let clock = create_test_clock(&mut scenario);
        let ctx = test_scenario::ctx(&mut scenario);

        // Try to create student with invalid duration (0) - should abort
        let student = student::create_profile(
            string::utf8(b"Mario"),
            string::utf8(b"Rossi"),
            25,
            string::utf8(b"cv_hash_123"),
            string::utf8(b"profile_img_url"),
            100000,
            20,
            0, // Invalid: must be > 0
            &clock,
            ctx
        );

        // This should never execute due to the abort above
        test_utils::destroy(student);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_update_student_unauthorized() {
        let mut scenario = test_scenario::begin(STUDENT_ADDR);
        let clock = create_test_clock(&mut scenario);

        // Create student profile
        let mut student = student::create_profile(
            string::utf8(b"Mario"),
            string::utf8(b"Rossi"),
            25,
            string::utf8(b"cv_hash_123"),
            string::utf8(b"profile_img_url"),
            100000,
            20,
            24,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Switch to different user and try to update (should fail)
        test_scenario::next_tx(&mut scenario, ADMIN_ADDR);
        
        student::update_profile(
            &mut student,
            string::utf8(b"Luigi"),
            string::utf8(b"Bianchi"),
            30,
            string::utf8(b"new_cv_hash"),
            string::utf8(b"new_profile_img"),
            150000,
            25,
            36,
            test_scenario::ctx(&mut scenario)
        );

        // This should never execute due to the abort above
        test_utils::destroy(student);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
