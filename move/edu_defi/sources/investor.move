module edu_defi::investor {
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::string::String;
    use edu_defi::errors;

    // ============ Events ============
    
    public struct InvestorProfileCreated has copy, drop {
        investor_id: address,
        owner: address,
        name: String,
        surname: String,
        age: u64,
    }
    
    public struct InvestorProfileUpdated has copy, drop {
        investor_id: address,
        owner: address,
        name: String,
        surname: String,
        age: u64,
    }

    /// Investor profile structure
    public struct Investor has key, store {
        id: UID,
        owner: address,
        name: String,
        surname: String,
        age: u64,
        profile_image: String,
        created_at: u64,
    }

    /// Create an investor profile and return it
    public fun create_profile(
        name: String,
        surname: String,
        age: u64,
        profile_image: String,
        clock: &Clock,
        ctx: &mut TxContext
    ): Investor {
        let investor = Investor {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            name,
            surname,
            age,
            profile_image,
            created_at: clock::timestamp_ms(clock),
        };
        
        // Emit event for investor profile creation
        event::emit(InvestorProfileCreated {
            investor_id: object::uid_to_address(&investor.id),
            owner: tx_context::sender(ctx),
            name,
            surname,
            age,
        });
        
        investor
    }

    /// Get investor ID as address
    public fun get_address(investor: &Investor): address {
        object::uid_to_address(&investor.id)
    }

    /// Update investor profile
    public fun update_profile(
        investor: &mut Investor,
        name: String,
        surname: String,
        age: u64,
        profile_image: String,
        ctx: &mut TxContext
    ) {
        assert!(investor.owner == tx_context::sender(ctx), errors::unauthorized());
        
        investor.name = name;
        investor.surname = surname;
        investor.age = age;
        investor.profile_image = profile_image;
        
        // Emit event for investor profile update
        event::emit(InvestorProfileUpdated {
            investor_id: object::uid_to_address(&investor.id),
            owner: tx_context::sender(ctx),
            name,
            surname,
            age,
        });
    }

    /// Get investor information
    public fun get_info(investor: &Investor): (String, String, u64, String) {
        (investor.name, investor.surname, investor.age, investor.profile_image)
    }
}