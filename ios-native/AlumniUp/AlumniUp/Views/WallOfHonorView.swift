import SwiftUI

/// Wall of Honor: the class year leaderboard (where Bold Detroit
/// rivalry energy lives inside the Heritage frame) and the grid of
/// recognized supporters.
struct WallOfHonorView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    header
                    leaderboard
                    supporters
                }
                .padding(20)
            }
            .background(Heritage.cream)
            .navigationTitle("Wall of Honor")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            SectionLabel(text: "Public Record")
            Text("The alumni and supporters helping Detroit schools.")
                .font(.subheadline)
                .foregroundStyle(Heritage.muted)
            Text("Donors who choose to remain anonymous appear simply as Anonymous.")
                .font(.caption)
                .foregroundStyle(Heritage.muted)
        }
    }

    private var leaderboard: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Class Year Leaderboard")
                .font(displayFont(24))
                .foregroundStyle(Heritage.navy)
            Text("Which graduating class is leading the way for Detroit students?")
                .font(.caption)
                .foregroundStyle(Heritage.muted)
                .padding(.bottom, 6)
            ForEach(Array(MockData.classYears.enumerated()), id: \.element.id) { index, standing in
                HStack(spacing: 12) {
                    Text("\(index + 1)")
                        .font(displayFont(20))
                        .foregroundStyle(index == 0 ? Heritage.gold : Heritage.muted)
                        .frame(width: 24)
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("Class of \(String(standing.year))")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Heritage.navy)
                            Spacer()
                            Text(Money.whole(standing.totalGiven))
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(Heritage.gold)
                        }
                        FundingBar(fraction: Double(standing.totalGiven) / Double(MockData.classYears[0].totalGiven))
                        Text("\(standing.donorCount) donor\(standing.donorCount == 1 ? "" : "s")")
                            .font(.caption2)
                            .foregroundStyle(Heritage.muted)
                    }
                }
                .padding(.vertical, 6)
                if index < MockData.classYears.count - 1 {
                    Divider()
                }
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Heritage.paper, in: RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(Heritage.line, lineWidth: 1))
        .shadow(color: Heritage.navy.opacity(0.07), radius: 10, y: 4)
    }

    private var supporters: some View {
        VStack(alignment: .leading, spacing: 14) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Recognized Supporters")
                    .font(displayFont(24))
                    .foregroundStyle(Heritage.navy)
                Text("Most recent contributions in recognition of these needs.")
                    .font(.caption)
                    .foregroundStyle(Heritage.muted)
            }
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(MockData.supporters) { supporter in
                    VStack(alignment: .leading, spacing: 5) {
                        HStack(alignment: .top) {
                            Text(supporter.displayName)
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(Heritage.navy)
                                .lineLimit(2)
                            Spacer()
                            Text(Money.whole(supporter.amount))
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(Heritage.gold)
                        }
                        Text(supporter.classYear.map { "Class of \($0)" } ?? "Class year not shared")
                            .font(.caption2)
                            .foregroundStyle(Heritage.muted)
                        if let message = supporter.message {
                            Text("\u{201C}\(message)\u{201D}")
                                .font(.caption.italic())
                                .foregroundStyle(Heritage.ink)
                                .padding(.top, 2)
                        }
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, minHeight: 96, alignment: .topLeading)
                    .background(Heritage.paper, in: RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Heritage.line, lineWidth: 1))
                }
            }
        }
    }
}

#Preview {
    WallOfHonorView()
}
