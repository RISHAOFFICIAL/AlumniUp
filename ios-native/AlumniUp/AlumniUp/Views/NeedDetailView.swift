import SwiftUI

/// Need detail: full story, funding state, and the path to give.
/// The Donate button opens the donation sheet.
struct NeedDetailView: View {
    let need: Need
    @State private var showDonate = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                ZStack(alignment: .topLeading) {
                    Image(need.imageName)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 260)
                        .clipped()
                    HStack {
                        VerifiedBadge()
                        Spacer()
                        CategoryChip(text: need.category)
                    }
                    .padding(16)
                }
                VStack(alignment: .leading, spacing: 14) {
                    Text(need.title)
                        .font(displayFont(28))
                        .foregroundStyle(Heritage.navy)
                    Text("\(need.schoolName) · Posted by \(need.postedBy), \(need.posterRole)")
                        .font(.subheadline)
                        .foregroundStyle(Heritage.muted)
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text(Money.whole(need.raised))
                            .font(displayFont(32))
                            .foregroundStyle(Heritage.navy)
                        Text("raised of \(Money.whole(need.goal)) goal")
                            .font(.subheadline)
                            .foregroundStyle(Heritage.muted)
                    }
                    FundingBar(fraction: need.percentFunded)
                    HStack {
                        Label("\(need.donorCount) donors", systemImage: "person.2.fill")
                        Spacer()
                        Text("\(Int(need.percentFunded * 100))% funded")
                            .fontWeight(.semibold)
                            .foregroundStyle(Heritage.gold)
                        Text("· \(need.priority)")
                    }
                    .font(.caption)
                    .foregroundStyle(Heritage.muted)
                    if let minimum = need.minimumToBegin {
                        Label("This need can begin at \(Money.whole(minimum)) funded.", systemImage: "flag.fill")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Heritage.green)
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Heritage.greenBg, in: RoundedRectangle(cornerRadius: 10))
                    }
                    GoldGlassButton(title: "Donate to This Need", systemImage: "heart.fill") {
                        showDonate = true
                    }
                    .padding(.top, 4)
                    Divider().padding(.vertical, 4)
                    SectionLabel(text: "The Need")
                    Text(need.description)
                        .font(.body)
                        .foregroundStyle(Heritage.ink)
                        .lineSpacing(5)
                    feeNote
                }
                .padding(20)
            }
        }
        .background(Heritage.cream)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showDonate) {
            DonateSheet(need: need)
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
        }
    }

    private var feeNote: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Donations are tax-deductible via Childs Play Foundation, Inc. (501(c)(3), EIN 86-2707543).")
                .font(.caption)
                .foregroundStyle(Heritage.muted)
                .lineSpacing(3)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Heritage.greenBg, in: RoundedRectangle(cornerRadius: 12))
    }
}

/// Donation sheet, mirroring the approved Heritage Premium modal:
/// the need's photo on top, amount chips, one-time or monthly, and one
/// strong gold button.
///
/// Apple charitable giving rules: this app does not collect donations
/// in-app. The button opens the fiscal sponsor's web checkout (Stripe
/// hosted) in the browser, where the gift is made to Childs Play
/// Foundation, Inc. (501(c)(3), EIN 86-2707543). The chosen amount rides
/// along as a deep link so the web donate sheet opens preselected.
/// No payment is processed inside this app, and no fake confirmation
/// is shown here.
struct DonateSheet: View {
    let need: Need
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL
    @State private var amount: Int = 50
    @State private var customAmount: String = ""
    @State private var isMonthly = false

    private let amounts = [25, 50, 100, 250, 500, 1000]

    private var effectiveAmount: Int {
        if let custom = Int(customAmount), custom > 0 { return custom }
        return amount
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                ZStack(alignment: .bottomLeading) {
                    Image(need.imageName)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 150)
                        .clipped()
                    LinearGradient(colors: [Heritage.navyDeep.opacity(0.75), .clear], startPoint: .bottom, endPoint: .top)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(need.title)
                            .font(displayFont(20))
                            .foregroundStyle(.white)
                            .lineLimit(2)
                        Text("\(need.schoolName) · \(Money.whole(need.raised)) of \(Money.whole(need.goal)) raised")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.85))
                    }
                    .padding(16)
                }
                VStack(alignment: .leading, spacing: 18) {
                    VStack(alignment: .leading, spacing: 10) {
                        fieldLabel("Amount")
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                            ForEach(amounts, id: \.self) { value in
                                Button {
                                    amount = value
                                    customAmount = ""
                                } label: {
                                    Text(Money.whole(value))
                                        .font(.body.weight(.semibold))
                                        .frame(maxWidth: .infinity, minHeight: 44)
                                }
                                .buttonStyle(.glass)
                                .tint(amount == value && customAmount.isEmpty ? Heritage.navy : nil)
                                .foregroundStyle(amount == value && customAmount.isEmpty ? .white : Heritage.navy)
                            }
                        }
                        TextField("Custom amount", text: $customAmount)
                            .keyboardType(.numberPad)
                            .textFieldStyle(.roundedBorder)
                    }
                    VStack(alignment: .leading, spacing: 10) {
                        fieldLabel("Frequency")
                        HStack(spacing: 10) {
                            freqButton("One-time", selected: !isMonthly) { isMonthly = false }
                            freqButton("Monthly", selected: isMonthly) { isMonthly = true }
                        }
                    }
                    Text("Tax-deductible via Childs Play Foundation, Inc. (501(c)(3), EIN 86-2707543).")
                        .font(.caption)
                        .foregroundStyle(Heritage.muted)
                        .padding(.vertical, 4)
                    Text("Your gift is completed on our secure website, in your browser. Your tax receipt is emailed instantly.")
                        .font(.caption)
                        .foregroundStyle(Heritage.muted)
                    GoldGlassButton(title: "Continue to Secure Checkout", systemImage: "arrow.up.forward.app.fill") {
                        openURL(need.webCheckoutURL(amount: effectiveAmount, isMonthly: isMonthly))
                        dismiss()
                    }
                    Label("Secure checkout by Stripe · Tax receipt emailed instantly", systemImage: "lock.fill")
                        .font(.caption2)
                        .foregroundStyle(Heritage.muted)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
                .padding(20)
            }
        }
        .background(Heritage.paper)
    }

    private func fieldLabel(_ text: String) -> some View {
        Text(text.uppercased())
            .font(.caption.weight(.bold))
            .tracking(1.6)
            .foregroundStyle(Heritage.muted)
    }

    private func freqButton(_ title: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.body.weight(.semibold))
                .frame(maxWidth: .infinity, minHeight: 44)
        }
        .buttonStyle(.glass)
        .tint(selected ? Heritage.gold : nil)
        .foregroundStyle(selected ? .white : Heritage.navy)
    }
}

#Preview {
    NeedDetailView(need: MockData.needs[0])
}
