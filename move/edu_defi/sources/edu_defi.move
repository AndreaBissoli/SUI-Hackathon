/// Module: edu_defi
module edu_defi::edu_defi {
    
    use edu_defi::student::{Self};
    use edu_defi::investor::{Self};
    use edu_defi::contract::{Self, Contract};
    use edu_defi::errors;
    use sui::event;
    use sui::clock::Clock;
    use std::string::String;
    use sui::table::{Self as table, Table};

    public struct ContractProposedEvent has copy, drop {
        contract_address: address,
        student_address: address,
        investor_address: address,
    }

    public struct ContractRejectedEvent has copy, drop {
        contract_address: address,
        student_address: address,
        investor_address: address,
    }
    

    public struct ServiceRegistry has key {
        id: UID,
        students: Table<address, address>,
        investors: Table<address, address>,
        contracts: vector<address>, // keep order if you really need it
    }

    fun init(ctx: &mut TxContext) {
        let registry = ServiceRegistry {
            id: object::new(ctx),
            students: table::new(ctx),
            investors: table::new(ctx),
            contracts: vector::empty(),
        };
        transfer::share_object(registry);
    }

    /// Add contract to registry
    fun add_contract(registry: &mut ServiceRegistry, contract_address: address) {
        vector::push_back(&mut registry.contracts, contract_address);
    }

    /// Remove contract from registry
    fun remove_contract(registry: &mut ServiceRegistry, contract_address: address) {
        let (found, index) = vector::index_of(&registry.contracts, &contract_address);
        if (found) {
            vector::remove(&mut registry.contracts, index);
        };
    }

    /// Create a student profile
    #[allow(lint(self_transfer))]
    public fun student_create_profile(
        name: String,
        surname: String,
        age: u64,
        cv_hash: String,
        profile_image: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
        registry: &mut ServiceRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!table::contains(&registry.students, tx_context::sender(ctx)), errors::already_registered());
        let student = student::create_profile(
            name,
            surname,
            age,
            cv_hash,
            profile_image,
            funding_requested,
            equity_percentage,
            duration_months,
            clock,
            ctx
        );
        table::add(&mut registry.students, tx_context::sender(ctx), student::get_address(&student));
        transfer::public_transfer(student, tx_context::sender(ctx));
    }

    /// Create an investor profile
    #[allow(lint(self_transfer))]
    public fun investor_create_profile(
        name: String,
        surname: String,
        age: u64,
        profile_image: String,
        registry: &mut ServiceRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!table::contains(&registry.investors, tx_context::sender(ctx)), errors::already_registered());
        let investor = investor::create_profile(
            name,
            surname,
            age,
            profile_image,
            clock,
            ctx
        );
        let investor_address = investor::get_address(&investor);
        table::add(&mut registry.investors, tx_context::sender(ctx), investor_address);
        transfer::public_transfer(investor, tx_context::sender(ctx));
    }

    /// Investor proposes a contract to a student
    public fun investor_propose_contract(
        student_address: address,
        pdf_hash: String,
        funding_amount: u64,
        release_interval_days: u64,
        equity_percentage: u64,
        duration_months: u64,
        registry: &mut ServiceRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&registry.investors, tx_context::sender(ctx)), errors::unauthorized());
        let contract_address = contract::create_and_share_contract(
            student_address,
            pdf_hash,
            funding_amount,
            release_interval_days,
            equity_percentage,
            duration_months,
            clock,
            ctx
        );
        
        add_contract(registry, contract_address);
        // Emit event for frontend notification
        event::emit(ContractProposedEvent {
            contract_address,
            student_address,
            investor_address: tx_context::sender(ctx),
        });
 
    }

    /// Student rejects a proposed contract and removes it from registry
    public fun student_reject_contract(
        contract: &Contract,
        registry: &mut ServiceRegistry,
        ctx: &mut TxContext
    ) {
        // Verify the sender is a registered student
        assert!(table::contains(&registry.students, tx_context::sender(ctx)), errors::unauthorized());
        
        // Call the contract module's reject function to perform validation
        contract::reject_contract(contract, ctx);
        
        // Get contract info for the event
        let (student_address, investor_address, _, _, _, _, _) = contract::get_info(contract);
        let contract_address = contract::get_address(contract);
        
        // Remove contract from registry
        remove_contract(registry, contract_address);
        
        // Emit event for contract rejection
        event::emit(ContractRejectedEvent {
            contract_address,
            student_address,
            investor_address,
        });
    }


    #[test_only]
    public fun create_registry_for_testing(ctx: &mut TxContext): ServiceRegistry {
        ServiceRegistry {
            id: object::new(ctx),
            students: table::new(ctx),
            investors: table::new(ctx),
            contracts: vector::empty()
        }
    }

    #[test_only]
    public fun get_registry_stats(registry: &ServiceRegistry): (u64, u64, u64) {
        (
            table::length(&registry.students),
            table::length(&registry.investors),
            vector::length(&registry.contracts),
        )
    }
}