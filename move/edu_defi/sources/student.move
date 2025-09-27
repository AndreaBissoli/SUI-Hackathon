module edu_defi::student {
    use sui::clock::{Self, Clock};
    use std::string::String;

    // ============ Error Codes ============
    const E_INVALID_AMOUNT: u64 = 1;
    const E_INVALID_PERCENTAGE: u64 = 2;
    const E_UNAUTHORIZED: u64 = 6;
    const E_INVALID_DURATION: u64 = 9;

    /// Student profile structure
    public struct Student has key, store {
        id: UID,
        owner: address,
        name: String,
        surname: String,
        age: u64,
        cv_hash: String,
        profile_image: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
        created_at: u64,
    }

    /// Create a student profile and return it
    public fun create_profile(
        name: String,
        surname: String,
        age: u64,
        cv_hash: String,
        profile_image: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): Student {
        assert!(equity_percentage <= 100, E_INVALID_PERCENTAGE);
        assert!(funding_requested > 0, E_INVALID_AMOUNT);
        assert!(duration_months > 0, E_INVALID_DURATION);

        Student {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            name,
            surname,
            age,
            cv_hash,
            profile_image,
            funding_requested,
            equity_percentage,
            duration_months,
            created_at: clock::timestamp_ms(clock),
        }
    }

    /// Get student ID as address
    public fun get_address(student: &Student): address {
        object::uid_to_address(&student.id)
    }

    /// Update student profile
    public fun update_profile(
        student: &mut Student,
        name: String,
        surname: String,
        age: u64,
        cv_hash: String,
        profile_image: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
        ctx: &mut TxContext
    ) {
        assert!(student.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        assert!(equity_percentage <= 100, E_INVALID_PERCENTAGE);
        assert!(funding_requested > 0, E_INVALID_AMOUNT);
        assert!(duration_months > 0, E_INVALID_DURATION);

        student.name = name;
        student.surname = surname;
        student.age = age;
        student.cv_hash = cv_hash;
        student.profile_image = profile_image;
        student.funding_requested = funding_requested;
        student.equity_percentage = equity_percentage;
        student.duration_months = duration_months;
    }

    /// Get student information
    public fun get_info(student: &Student): (String, String, u64, String, u64, u64, u64) {
        (student.name, student.surname, student.age, student.cv_hash, 
         student.funding_requested, student.equity_percentage, student.duration_months)
    }
}