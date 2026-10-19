import Foundation

/// Sample data for the preview build. Identical spirit to the web
/// app's mock data: King High needs, four Detroit schools, sample
/// supporters and the class year leaderboard. Replaced by live
/// Supabase data when the backend switch is flipped.
enum MockData {
    static let schools: [School] = [
        School(id: "king", name: "Martin Luther King Jr. Senior High School", district: "Detroit Public Schools", isFoundingPartner: true, totalRaised: 5950, activeNeeds: 3),
        School(id: "ford", name: "Detroit Henry Ford High School", district: "Detroit Public Schools", isFoundingPartner: true, totalRaised: 0, activeNeeds: 0),
        School(id: "cass", name: "Cass Technical High School", district: "Detroit Public Schools", isFoundingPartner: true, totalRaised: 0, activeNeeds: 0),
        School(id: "renaissance", name: "Renaissance High School", district: "Detroit Public Schools", isFoundingPartner: true, totalRaised: 0, activeNeeds: 0),
    ]

    static let needs: [Need] = [
        Need(
            id: "baseball",
            schoolName: "Martin Luther King Jr. Senior High School",
            title: "Varsity Baseball Field Flood Repair",
            category: "Sports",
            postedBy: "Sample Coach",
            posterRole: "Coach",
            description: "The varsity baseball field at King High suffers from severe drainage issues, causing flooding after every rain. Games are cancelled, practices move indoors, and our Crusaders lose home field advantage. This project funds a full drainage repair so the team can play a complete season on its own diamond.",
            goal: 18000, raised: 3200, donorCount: 12,
            priority: "High Priority", imageName: "NeedBaseball",
            minimumToBegin: 8500
        ),
        Need(
            id: "lighting",
            schoolName: "Martin Luther King Jr. Senior High School",
            title: "Performing Arts Stage Lighting Upgrade",
            category: "Arts",
            postedBy: "Sample Teacher",
            posterRole: "Teacher",
            description: "Our auditorium lighting system was installed in 1998 and is now failing. Several lights have stopped working, and the board shorts during performances. A modern LED rig gives our actors, dancers, and musicians the stage they deserve.",
            goal: 5500, raised: 1800, donorCount: 8,
            priority: "High Priority", imageName: "NeedStage",
            minimumToBegin: nil
        ),
        Need(
            id: "debate",
            schoolName: "Martin Luther King Jr. Senior High School",
            title: "Debate Team Coach Stipend",
            category: "Program Support",
            postedBy: "Sample Principal",
            posterRole: "Principal",
            description: "Our nationally ranked debate team has been without a dedicated coach for the current season. This stipend funds a part-time coach so the team's streak, and the scholarships that come with it, stay alive.",
            goal: 4000, raised: 950, donorCount: 5,
            priority: "Medium Priority", imageName: "NeedDebate",
            minimumToBegin: nil
        ),
    ]

    static let featuredNeed: Need = needs[0]

    static let supporters: [Supporter] = [
        Supporter(id: "s1", name: "", classYear: nil, amount: 1000, message: nil, isAnonymous: true),
        Supporter(id: "s2", name: "Marcus Reed", classYear: 1994, amount: 500, message: "Every contribution counts.", isAnonymous: false),
        Supporter(id: "s3", name: "James Carter", classYear: 1992, amount: 250, message: "Go Crusaders!", isAnonymous: false),
        Supporter(id: "s4", name: "Alicia Bennett", classYear: 2008, amount: 100, message: "Proud to support Detroit students.", isAnonymous: false),
        Supporter(id: "s5", name: "Dana Washington", classYear: 2011, amount: 150, message: "For the debate team!", isAnonymous: false),
        Supporter(id: "s6", name: "Robert Hayes", classYear: 1987, amount: 200, message: nil, isAnonymous: false),
        Supporter(id: "s7", name: "Tanya Brooks", classYear: 2019, amount: 120, message: "Keep the arts alive.", isAnonymous: false),
    ]

    static let classYears: [ClassYearStanding] = [
        ClassYearStanding(id: "y94", year: 1994, totalGiven: 500, donorCount: 1),
        ClassYearStanding(id: "y92", year: 1992, totalGiven: 250, donorCount: 1),
        ClassYearStanding(id: "y87", year: 1987, totalGiven: 200, donorCount: 1),
        ClassYearStanding(id: "y11", year: 2011, totalGiven: 150, donorCount: 1),
        ClassYearStanding(id: "y19", year: 2019, totalGiven: 120, donorCount: 1),
        ClassYearStanding(id: "y08", year: 2008, totalGiven: 100, donorCount: 1),
    ]

    static let totalRaised = 5950
    static let alumniDonors = 25
}
