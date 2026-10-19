import SwiftUI

/// Reusable Heritage Premium components, with Liquid Glass on the
/// functional layer per Apple's HIG: primary actions, badges that
/// float over photography, and the floating featured card.

// MARK: - Buttons

/// Primary gold action (Fund, Contribute, Donate) in Liquid Glass.
struct GoldGlassButton: View {
    let title: String
    var systemImage: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let systemImage { Image(systemName: systemImage) }
                Text(title).fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity, minHeight: 44)
            .padding(.horizontal, 20)
            .padding(.vertical, 6)
        }
        .buttonStyle(.glassProminent)
        .tint(Heritage.gold)
        .controlSize(.large)
    }
}

/// Secondary outlined action that pairs with the gold primary.
struct GhostGlassButton: View {
    let title: String
    var dark: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .fontWeight(.semibold)
                .foregroundStyle(dark ? .white : Heritage.navy)
                .frame(maxWidth: .infinity, minHeight: 44)
                .padding(.horizontal, 20)
                .padding(.vertical, 6)
        }
        .buttonStyle(.glass)
        .controlSize(.large)
    }
}

// MARK: - Badges and bars

/// "Verified" pill that floats over need photography. Icon plus
/// words, so color is never the only signal (HIG accessibility).
struct VerifiedBadge: View {
    var body: some View {
        Label("Verified", systemImage: "checkmark.seal.fill")
            .font(.caption2.weight(.bold))
            .tracking(0.6)
            .foregroundStyle(Heritage.green)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .glassEffect(.regular, in: .capsule)
    }
}

/// Category chip that floats over need photography.
struct CategoryChip: View {
    let text: String
    var body: some View {
        Text(text.uppercased())
            .font(.caption2.weight(.bold))
            .tracking(1.2)
            .foregroundStyle(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Heritage.navyDeep.opacity(0.78), in: Capsule())
    }
}

/// Gold funding progress bar.
struct FundingBar: View {
    let fraction: Double
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Color.black.opacity(0.07))
                Capsule()
                    .fill(LinearGradient(colors: [Heritage.gold, Heritage.goldLight], startPoint: .leading, endPoint: .trailing))
                    .frame(width: max(geo.size.width * fraction, 10))
            }
        }
        .frame(height: 9)
    }
}

// MARK: - Need card

/// Photo-first need card, the heart of the redesign. The whole card
/// navigates to the need detail; the Contribute button opens the
/// donation sheet directly.
struct NeedCard: View {
    let need: Need
    let onContribute: (Need) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .topLeading) {
                Image(need.imageName)
                    .resizable()
                    .scaledToFill()
                    .frame(height: 180)
                    .clipped()
                HStack {
                    VerifiedBadge()
                    Spacer()
                    CategoryChip(text: need.category)
                }
                .padding(12)
            }
            VStack(alignment: .leading, spacing: 6) {
                Text(need.title)
                    .font(displayFont(21))
                    .foregroundStyle(Heritage.navy)
                    .lineLimit(2)
                Text("\(need.schoolName) · Posted by \(need.postedBy)")
                    .font(.caption)
                    .foregroundStyle(Heritage.muted)
                    .lineLimit(1)
                HStack(alignment: .firstTextBaseline) {
                    Text(Money.whole(need.raised))
                        .font(displayFont(24))
                        .foregroundStyle(Heritage.navy)
                    Spacer()
                    Text("of \(Money.whole(need.goal)) goal")
                        .font(.caption)
                        .foregroundStyle(Heritage.muted)
                }
                .padding(.top, 4)
                FundingBar(fraction: need.percentFunded)
                HStack {
                    Label("\(need.donorCount) donors", systemImage: "person.2.fill")
                        .font(.caption)
                        .foregroundStyle(Heritage.muted)
                    Spacer()
                    Text("\(Int(need.percentFunded * 100))% funded")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Heritage.gold)
                }
                GoldGlassButton(title: "Contribute") { onContribute(need) }
                    .padding(.top, 6)
            }
            .padding(16)
        }
        .background(Heritage.paper, in: RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(Heritage.line, lineWidth: 1))
        .shadow(color: Heritage.navy.opacity(0.10), radius: 12, y: 6)
    }
}

/// Solid content card. Content stays on solid paper for legibility;
/// glass is reserved for actions and floating elements.
struct PaperCard<Content: View>: View {
    @ViewBuilder let content: Content
    var body: some View {
        content
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Heritage.paper, in: RoundedRectangle(cornerRadius: 18))
            .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(Heritage.line, lineWidth: 1))
            .shadow(color: Heritage.navy.opacity(0.07), radius: 10, y: 4)
    }
}

#Preview {
    ScrollView {
        NeedCard(need: MockData.needs[0], onContribute: { _ in })
            .padding()
    }
    .background(Heritage.cream)
}
