import Foundation

/// Core data models for AlumniUp. These mirror the web app's data
/// shapes (schools, needs, donations, wall of honor) so the native
/// app and the web app stay in step. Data is mock for now, the same
/// sample data the web preview uses, until the live Supabase backend
/// is switched on.
struct School: Identifiable, Hashable {
    let id: String
    let name: String
    let district: String
    let isFoundingPartner: Bool
    let totalRaised: Int
    let activeNeeds: Int
}

struct Need: Identifiable, Hashable {
    let id: String
    let schoolName: String
    let title: String
    let category: String
    let postedBy: String
    let posterRole: String
    let description: String
    let goal: Int
    let raised: Int
    let donorCount: Int
    let priority: String
    let imageName: String
    let minimumToBegin: Int?

    var percentFunded: Double {
        guard goal > 0 else { return 0 }
        return min(Double(raised) / Double(goal), 1)
    }
}

struct Supporter: Identifiable, Hashable {
    let id: String
    let name: String
    let classYear: Int?
    let amount: Int
    let message: String?
    let isAnonymous: Bool

    var displayName: String {
        if isAnonymous { return "Anonymous" }
        if let classYear {
            return "\(name) '\(String(classYear).suffix(2))"
        }
        return name
    }
}

struct ClassYearStanding: Identifiable, Hashable {
    let id: String
    let year: Int
    let totalGiven: Int
    let donorCount: Int
}
