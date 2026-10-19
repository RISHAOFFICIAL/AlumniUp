import SwiftUI

/// For Schools: the pitch to coaches, teachers, and administrators,
/// how verification works, the two pricing tiers, and the school
/// registration form (preview: submitting shows a confirmation and
/// sends nothing).
struct ForSchoolsView: View {
    @State private var schoolName = ""
    @State private var contactName = ""
    @State private var role = ""
    @State private var email = ""
    @State private var submitted = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    header
                    audiences
                    verification
                    pricing
                    registerForm
                }
                .padding(20)
            }
            .background(Heritage.cream)
            .navigationTitle("For Schools")
            .navigationBarTitleDisplayMode(.large)
            .alert("Registration received (preview)", isPresented: $submitted) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("In the live app this registration goes to the AlumniUp team for verification. This preview build sends nothing.")
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            SectionLabel(text: "For Coaches, Teachers & Admins")
            Text("A direct line from Detroit alumni to the classrooms, fields, and programs that need it most.")
                .font(.subheadline)
                .foregroundStyle(Heritage.muted)
                .lineSpacing(3)
        }
    }

    private var audiences: some View {
        VStack(spacing: 12) {
            audienceCard("For Coaches", "whistle", "Fund uniforms, equipment, field repairs, and travel. Stop paying out of pocket for the teams you lead.")
            audienceCard("For Teachers", "book.pages.fill", "Fund classroom supplies, field trips, and project materials. Alumni want to help specific, verified needs.")
            audienceCard("For Administrators", "building.columns.fill", "Fund building improvements, program support, and staff stipends through a trusted, tax-deductible channel.")
        }
    }

    private func audienceCard(_ title: String, _ icon: String, _ text: String) -> some View {
        PaperCard {
            VStack(alignment: .leading, spacing: 6) {
                Label(title, systemImage: icon)
                    .font(displayFont(20))
                    .foregroundStyle(Heritage.navy)
                Text(text)
                    .font(.subheadline)
                    .foregroundStyle(Heritage.muted)
                    .lineSpacing(3)
            }
        }
    }

    private var verification: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "How Verification Works")
            Text("Every school and every need is reviewed before it goes live, so donors give with confidence.")
                .font(.subheadline)
                .foregroundStyle(Heritage.muted)
            stepRow("01", "Register your school", "Submit the form below. We verify your school and confirm your staff role, typically within a few business days.")
            stepRow("02", "Post a verified need", "Each funding need is reviewed and confirmed with your school before it is published to donors.")
            stepRow("03", "Receive funds", "88% of every donation is disbursed to your school through our fiscal sponsor, Childs Play Foundation.")
        }
    }

    private func stepRow(_ number: String, _ title: String, _ text: String) -> some View {
        PaperCard {
            HStack(alignment: .top, spacing: 14) {
                Text(number)
                    .font(displayFont(26))
                    .foregroundStyle(Heritage.gold)
                    .frame(width: 40, alignment: .leading)
                VStack(alignment: .leading, spacing: 3) {
                    Text(title).font(.headline).foregroundStyle(Heritage.navy)
                    Text(text).font(.subheadline).foregroundStyle(Heritage.muted).lineSpacing(3)
                }
            }
        }
    }

    private var pricing: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "Pricing")
            tierCard(
                name: "Founding Partner", price: 99, highlighted: true,
                note: "Free Year 1 · First 7 schools",
                features: ["Verified need posting", "88% of donations to your school via Childs Play Foundation", "School profile page", "Donor tax receipts", "Locked $99/yr founding rate"]
            )
            tierCard(
                name: "Standard", price: 129, highlighted: false,
                note: "Free Year 1",
                features: ["Verified need posting", "88% of donations to your school via Childs Play Foundation", "School profile page", "Donor tax receipts"]
            )
            Text("Martin Luther King Jr. Senior High School · Free forever (Founding Partner).")
                .font(.caption)
                .foregroundStyle(Heritage.muted)
        }
    }

    private func tierCard(name: String, price: Int, highlighted: Bool, note: String, features: [String]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(name)
                .font(displayFont(21))
                .foregroundStyle(Heritage.navy)
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(Money.whole(price))
                    .font(displayFont(30))
                    .foregroundStyle(highlighted ? Heritage.gold : Heritage.navy)
                Text("/year").font(.subheadline).foregroundStyle(Heritage.muted)
            }
            Text(note).font(.caption).foregroundStyle(Heritage.muted)
            ForEach(features, id: \.self) { feature in
                Label(feature, systemImage: "checkmark")
                    .font(.subheadline)
                    .foregroundStyle(Heritage.ink)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Heritage.paper, in: RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(highlighted ? Heritage.gold : Heritage.line, lineWidth: highlighted ? 2 : 1))
        .shadow(color: Heritage.navy.opacity(0.07), radius: 10, y: 4)
    }

    private var registerForm: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "Get Started")
            Text("Register Your School")
                .font(displayFont(24))
                .foregroundStyle(Heritage.navy)
            Group {
                TextField("School Name", text: $schoolName)
                TextField("Contact Name", text: $contactName)
                TextField("Role (Coach, Teacher, Principal...)", text: $role)
                TextField("Work Email", text: $email)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
            }
            .textFieldStyle(.roundedBorder)
            GoldGlassButton(title: "Submit Registration") {
                submitted = true
            }
        }
    }
}

#Preview {
    ForSchoolsView()
}
