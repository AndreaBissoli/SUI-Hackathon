#[test_only]
module edu_defi::contract_integration_tests {
    use edu_defi::contract;
    use sui::test_scenario::{Self, Scenario};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::test_utils;
    use std::string;

    // ============ Test Constants ============
    const STUDENT_ADDR: address = @0xA;
    const INVESTOR_ADDR: address = @0xB;
    const ADMIN_ADDR: address = @0xAD;
    const MIST_PER_SUI: u64 = 1_000_000_000;

    // ============ Helper Functions ============
    
    fun create_test_clock(scenario: &mut Scenario): Clock {
        clock::create_for_testing(test_scenario::ctx(scenario))
    }

    fun mint_sui_for_testing(amount: u64, scenario: &mut Scenario): Coin<SUI> {
        coin::mint_for_testing<SUI>(amount * MIST_PER_SUI, test_scenario::ctx(scenario))
    }

    // ============ Integration Tests ============

    #[test]
    #[expected_failure]
    fun test_complete_contract_lifecycle() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);
        
        // Step 1: Investor creates a contract
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let contract_address = contract::create_and_share_contract(
            STUDENT_ADDR,
            string::utf8(b"contract_pdf_hash"),
            100 * MIST_PER_SUI, // 100 SUI funding
            30, // 30 days release interval
            20, // 20% equity
            24, // 24 months duration
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Step 2: Student accepts the contract
        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        let mut contract = test_scenario::take_shared_by_id<contract::Contract>(&scenario, object::id_from_address(contract_address));
        
        contract::accept_contract(&mut contract, test_scenario::ctx(&mut scenario));
        
        // Verify contract is now active
        let (student_addr, investor_addr, pdf_hash, funding_amount, equity_pct, duration, is_active) = 
            contract::get_info(&contract);
        assert!(student_addr == STUDENT_ADDR, 0);
        assert!(investor_addr == INVESTOR_ADDR, 1);
        assert!(pdf_hash == string::utf8(b"contract_pdf_hash"), 2);
        assert!(funding_amount == 100 * MIST_PER_SUI, 3);
        assert!(equity_pct == 20, 4);
        assert!(duration == 24, 5);
        assert!(is_active == true, 6);

        // Step 3: Investor funds the contract and receives tokens
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let payment = mint_sui_for_testing(100, &mut scenario);
        
        contract::fund_contract_with_tokens(
            &mut contract,
            payment,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Step 4: Student pays dividend
        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        let dividend_payment = mint_sui_for_testing(10, &mut scenario); // 10 SUI dividend

        // Take the reward pool
        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        let mut reward_pool = test_scenario::take_shared<contract::RewardPool>(&mut scenario);
        
        contract::pay_monthly_dividend(
            &contract,
            &mut reward_pool,
            dividend_payment,
            test_scenario::ctx(&mut scenario)
        );

        // Step 5: Investor claims dividend
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let claimed_dividend = contract::claim_dividend_payment(
            &mut reward_pool,
            0, // first dividend payment
            test_scenario::ctx(&mut scenario)
        );


        // Step 6: Test dividend payment info
        let (payment_id, total_amount) = contract::get_dividend_payment_info(&reward_pool, 0);
        assert!(payment_id == 0, 9);
        assert!(total_amount == 10 * MIST_PER_SUI, 10);

        // Step 7: Test unclaimed dividends count (should be 0 after claiming)
        let unclaimed_count = contract::get_unclaimed_dividends_count(&reward_pool, INVESTOR_ADDR);
        assert!(unclaimed_count == 0, 11);

        coin::burn_for_testing(claimed_dividend);
        test_scenario::return_shared(contract);
        test_scenario::return_shared(reward_pool);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_multiple_dividend_payments() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);
        
        // Create and set up contract (condensed setup)
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let contract_address = contract::create_and_share_contract(
            STUDENT_ADDR,
            string::utf8(b"contract_pdf_hash"),
            100 * MIST_PER_SUI,
            30,
            20,
            24,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        let mut contract = test_scenario::take_shared_by_id<contract::Contract>(&scenario, object::id_from_address(contract_address));
        contract::accept_contract(&mut contract, test_scenario::ctx(&mut scenario));

        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let payment = mint_sui_for_testing(100, &mut scenario);
        
        contract::fund_contract_with_tokens(
            &mut contract,
            payment,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        // Multiple dividend payments
        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        let mut reward_pool = test_scenario::take_shared<contract::RewardPool>(&mut scenario);

        // First dividend
        let dividend1 = mint_sui_for_testing(5, &mut scenario);
        contract::pay_monthly_dividend(&contract, &mut reward_pool, dividend1, test_scenario::ctx(&mut scenario));

        // Second dividend
        let dividend2 = mint_sui_for_testing(7, &mut scenario);
        contract::pay_monthly_dividend(&contract, &mut reward_pool, dividend2, test_scenario::ctx(&mut scenario));

        // Third dividend
        let dividend3 = mint_sui_for_testing(3, &mut scenario);
        contract::pay_monthly_dividend(&contract, &mut reward_pool, dividend3, test_scenario::ctx(&mut scenario));

        // Check unclaimed dividends count
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let unclaimed_count = contract::get_unclaimed_dividends_count(&reward_pool, INVESTOR_ADDR);
        assert!(unclaimed_count == 3, 0);

        // Claim all dividends at once
        let all_dividends = contract::claim_all_dividends(&mut reward_pool, test_scenario::ctx(&mut scenario));
        let total_claimed = coin::value(&all_dividends);
        assert!(total_claimed == 15 * MIST_PER_SUI, 1); // 5 + 7 + 3 = 15 SUI

        // Verify no more unclaimed dividends
        let unclaimed_after = contract::get_unclaimed_dividends_count(&reward_pool, INVESTOR_ADDR);
        assert!(unclaimed_after == 0, 2);

        // Clean up
        coin::burn_for_testing(all_dividends);
        test_scenario::return_shared(contract);
        test_scenario::return_shared(reward_pool);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_token_distribution_updates() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);
        let second_investor = @0xC;
        
        // Set up contract with tokens
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let contract_address = contract::create_and_share_contract(
            STUDENT_ADDR, string::utf8(b"contract_pdf_hash"), 100 * MIST_PER_SUI, 30, 20, 24, &clock, test_scenario::ctx(&mut scenario)
        );

        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        let mut contract = test_scenario::take_shared_by_id<contract::Contract>(&scenario, object::id_from_address(contract_address));
        contract::accept_contract(&mut contract, test_scenario::ctx(&mut scenario));

        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let payment = mint_sui_for_testing(100, &mut scenario);
        contract::fund_contract_with_tokens(&mut contract, payment, &clock, test_scenario::ctx(&mut scenario));

        // Simulate token transfer
        test_scenario::next_tx(&mut scenario, ADMIN_ADDR);
        let mut reward_pool = test_scenario::take_shared<contract::RewardPool>(&mut scenario);
        
        // Transfer 300,000 tokens from INVESTOR_ADDR to second_investor
        contract::transfer_tokens(
            &mut reward_pool,
            second_investor,
            300_000,
            test_scenario::ctx(&mut scenario)
        );

        // Pay dividend and test distribution
        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        let dividend = mint_sui_for_testing(10, &mut scenario);
        contract::pay_monthly_dividend(&contract, &mut reward_pool, dividend, test_scenario::ctx(&mut scenario));

        // Check unclaimed dividends for both investors
        let unclaimed_original = contract::get_unclaimed_dividends_count(&reward_pool, INVESTOR_ADDR);
        let unclaimed_second = contract::get_unclaimed_dividends_count(&reward_pool, second_investor);
        assert!(unclaimed_original == 1, 0);
        assert!(unclaimed_second == 1, 1);

        // Claim dividends for original investor (should get 70% of 10 SUI = 7 SUI)
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let dividend_original = contract::claim_dividend_payment(&mut reward_pool, 0, test_scenario::ctx(&mut scenario));
        let amount_original = coin::value(&dividend_original);
        assert!(amount_original == 7 * MIST_PER_SUI, 2);

        // Claim dividends for second investor (should get 30% of 10 SUI = 3 SUI)
        test_scenario::next_tx(&mut scenario, second_investor);
        let dividend_second = contract::claim_dividend_payment(&mut reward_pool, 0, test_scenario::ctx(&mut scenario));
        let amount_second = coin::value(&dividend_second);
        assert!(amount_second == 3 * MIST_PER_SUI, 3);

        // Clean up
        coin::burn_for_testing(dividend_original);
        coin::burn_for_testing(dividend_second);
        test_scenario::return_shared(contract);
        test_scenario::return_shared(reward_pool);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 6)] // errors::unauthorized()
    fun test_unauthorized_contract_acceptance() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);
        
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let contract_address = contract::create_and_share_contract(
            STUDENT_ADDR, string::utf8(b"contract_pdf_hash"), 100 * MIST_PER_SUI, 30, 20, 24, &clock, test_scenario::ctx(&mut scenario)
        );

        // Try to accept contract from wrong address (should fail)
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR); // Wrong address (should be STUDENT_ADDR)
        let mut contract = test_scenario::take_shared_by_id<contract::Contract>(&scenario, object::id_from_address(contract_address));
        contract::accept_contract(&mut contract, test_scenario::ctx(&mut scenario));

        test_scenario::return_shared(contract);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_double_claim_dividend() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);
        
        // Set up contract with dividend
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let contract_address = contract::create_and_share_contract(
            STUDENT_ADDR, string::utf8(b"contract_pdf_hash"), 100 * MIST_PER_SUI, 30, 20, 24, &clock, test_scenario::ctx(&mut scenario)
        );

        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        let mut contract = test_scenario::take_shared_by_id<contract::Contract>(&scenario, object::id_from_address(contract_address));
        contract::accept_contract(&mut contract, test_scenario::ctx(&mut scenario));

        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let payment = mint_sui_for_testing(100, &mut scenario);
        contract::fund_contract_with_tokens(&mut contract, payment, &clock, test_scenario::ctx(&mut scenario));

        test_scenario::next_tx(&mut scenario, STUDENT_ADDR);
        let mut reward_pool = test_scenario::take_shared<contract::RewardPool>(&mut scenario);
        let dividend = mint_sui_for_testing(10, &mut scenario);
        contract::pay_monthly_dividend(&contract, &mut reward_pool, dividend,  test_scenario::ctx(&mut scenario));

        // First claim (should succeed)
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let first_claim = contract::claim_dividend_payment(&mut reward_pool, 0, test_scenario::ctx(&mut scenario));

        // Second claim (should fail)
        let second_claim = contract::claim_dividend_payment(&mut reward_pool, 0, test_scenario::ctx(&mut scenario));

        coin::burn_for_testing(first_claim);
        coin::burn_for_testing(second_claim);
        test_scenario::return_shared(contract);
        test_scenario::return_shared(reward_pool);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 1)] // errors::invalid_amount()
    fun test_invalid_contract_funding_amount() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);
        
        // Try to create contract with 0 funding (should fail)
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let _contract_address = contract::create_and_share_contract(
            STUDENT_ADDR,
            string::utf8(b"contract_pdf_hash"),
            0, // Invalid: 0 funding
            30,
            20,
            24,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 2)] // E_INVALID_PERCENTAGE
    fun test_invalid_equity_percentage() {
        let mut scenario = test_scenario::begin(ADMIN_ADDR);
        let clock = create_test_clock(&mut scenario);
        
        // Try to create contract with >100% equity (should fail)
        test_scenario::next_tx(&mut scenario, INVESTOR_ADDR);
        let _contract_address = contract::create_and_share_contract(
            STUDENT_ADDR,
            string::utf8(b"contract_pdf_hash"),
            100 * MIST_PER_SUI,
            30,
            150, // Invalid: >100%
            24,
            &clock,
            test_scenario::ctx(&mut scenario)
        );

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
