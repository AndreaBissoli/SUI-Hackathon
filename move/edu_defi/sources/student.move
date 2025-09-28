module edu_defi::student {
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::string::String;
    use edu_defi::errors;

    // ============ Events ============
    
    public struct StudentProfileCreated has copy, drop {
        student_id: address,
        owner: address,
        name: String,
        surname: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
    }
    
    public struct StudentProfileUpdated has copy, drop {
        student_id: address,
        owner: address,
        name: String,
        surname: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
    }

    /// Student profile structure
    public struct Student has key, store {
        id: UID,
        owner: address,
        name: String,
        surname: String,
        age: u64,
        cv_url: String,
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
        cv_url: String,
        profile_image: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): Student {
        assert!(equity_percentage <= 100, errors::invalid_percentage());
        assert!(funding_requested > 0, errors::invalid_amount());
        assert!(duration_months > 0, errors::invalid_duration());

        let student = Student {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            name,
            surname,
            age,
            cv_url,
            profile_image,
            funding_requested,
            equity_percentage,
            duration_months,
            created_at: clock::timestamp_ms(clock),
        };
        
        // Emit event for student profile creation
        event::emit(StudentProfileCreated {
            student_id: object::uid_to_address(&student.id),
            owner: tx_context::sender(ctx),
            name,
            surname,
            funding_requested,
            equity_percentage,
            duration_months,
        });
        
        student
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
        cv_url: String,
        profile_image: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
        ctx: &mut TxContext
    ) {
        assert!(student.owner == tx_context::sender(ctx), errors::unauthorized());
        assert!(equity_percentage <= 100, errors::invalid_duration());
        assert!(funding_requested > 0, errors::invalid_amount());
        assert!(duration_months > 0, errors::invalid_duration());

        student.name = name;
        student.surname = surname;
        student.age = age;
        student.cv_url = cv_url;
        student.profile_image = profile_image;
        student.funding_requested = funding_requested;
        student.equity_percentage = equity_percentage;
        student.duration_months = duration_months;
        
        // Emit event for student profile update
        event::emit(StudentProfileUpdated {
            student_id: object::uid_to_address(&student.id),
            owner: tx_context::sender(ctx),
            name,
            surname,
            funding_requested,
            equity_percentage,
            duration_months,
        });
    }

    /// Get student information
    public fun get_info(student: &Student): (String, String, u64, String, u64, u64, u64) {
        (student.name, student.surname, student.age, student.cv_url, 
         student.funding_requested, student.equity_percentage, student.duration_months)
    }
}