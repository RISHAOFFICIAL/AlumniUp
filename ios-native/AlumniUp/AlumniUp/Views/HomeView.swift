import SwiftUI

/// Home: the Heritage Premium homepage from the approved mockup.
/// Photo hero with the headline on navy, floating featured need,
/// photo-first need cards, navy How It Works, the class year
/// leaderboard beside the trust panel, and the founder story.
struct HomeView: View {
    @State private var donateNeed: Need?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    previewBanner
                    hero
                    featuredCard
                        .padding(.horizontal, 20)
                        .offset(y: -34)
                        .padding(.bottom, -14)
                    statsRow
                    openNeeds
                    howItWorks
                    leaderboardAndTrust
                    founder
                    footerNote
                }
            }
            .background(Heritage.cream)
            .ignoresSafeArea(edges: .top)
            .navigationTitle("")
            .toolbar(.hidden, for: .navigationBar)
            .sheet(item: $donateNeed) { need in
                DonateSheet(need: need)
                    .presentationDetents([.large])
                    .presentationDragIndicator(.visible)
            }
        }
    }

    // MARK: Sections

    private var previewBanner: some View {
        Text("Preview · Sample data for demonstration. No real donations have occurred.")
            .font(.caption2.weight(.semibold))
            .foregroundStyle(Heritage.navyDeep)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
            .padding(.top, 44)
            .background(Heritage.goldLight)
    }

    private var hero: some View {
        ZStack(alignment: .bottomLeading) {
            Image("HeroStudents")
                .resizable()
                .scaledToFill()
                .frame(height: 430)
                .clipped()
            LinearGradient(
                colors: [Heritage.navyDeep.opacity(0.88), Heritage.navy.opacity(0.45), .clear],
                startPoint: .bottom, endPoint: .top
            )
            VStack(alignment: .leading, spacing: 10) {
                SectionLabel(text: "Detroit Public Schools · Alumni Giving")
                Text("Your alma mater\nneeds you. **Again.**")
                    .font(displayFont(40))
                    .foregroundStyle(.white)
                    .lineSpacing(2)
                Text("Verified funding needs from the coaches, teachers, and administrators shaping Detroit's next generation.")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.85))
                    .padding(.trailing, 30)
                    .padding(.bottom, 46)
            }
            .padding(.horizontal, 20)
        }
    }

    private var featuredCard: some View {
        let need = MockData.featuredNeed
        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("FEATURED NEED")
                    .font(.caption2.weight(.bold))
                    .tracking(1.6)
                    .foregroundStyle(Heritage.gold)
                Spacer()
                Label("Verified", systemImage: "checkmark.seal.fill")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(Heritage.green)
            }
            Text(need.title)
                .font(displayFont(22))
                .foregroundStyle(Heritage.navy)
            Text(need.schoolName)
                .font(.caption)
                .foregroundStyle(Heritage.muted)
            FundingBar(fraction: need.percentFunded)
                .padding(.top, 4)
            HStack {
                Text("\(Money.whole(need.raised)) raised").font(.caption.weight(.semibold)).foregroundStyle(Heritage.navy)
                Spacer()
                Text("of \(Money.whole(need.goal)) · \(need.donorCount) donors").font(.caption).foregroundStyle(Heritage.muted)
            }
            GoldGlassButton(title: "Fund This Need") { donateNeed = need }
                .padding(.top, 4)
        }
        .padding(18)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20))
        .background(Heritage.paper.opacity(0.82), in: RoundedRectangle(cornerRadius: 20))
        .overlay(RoundedRectangle(cornerRadius: 20).strokeBorder(Heritage.gold.opacity(0.45), lineWidth: 1))
        .shadow(color: Heritage.navy.opacity(0.22), radius: 20, y: 10)
    }

    private var statsRow: some View {
        HStack(alignment: .top) {
            stat(Money.whole(MockData.totalRaised), "Raised so far")
            stat("\(MockData.alumniDonors)", "Alumni donors")
            stat("\(MockData.schools.count)", "Schools live")
            stat("88%", "Goes to schools")
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 18)
    }

    private func stat(_ value: String, _ caption: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(displayFont(21))
                .foregroundStyle(Heritage.navy)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(caption.uppercased())
                .font(.system(size: 8.5, weight: .bold))
                .tracking(0.8)
                .foregroundStyle(Heritage.muted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }

    private var openNeeds: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                SectionLabel(text: "Open Needs")
                Text("Fund a need.\nChange a season.")
                    .font(displayFont(30))
                    .foregroundStyle(Heritage.navy)
                Text("Every need is posted by verified school staff and reviewed before it goes live.")
                    .font(.subheadline)
                    .foregroundStyle(Heritage.muted)
            }
            ForEach(MockData.needs) { need in
                NavigationLink(value: need) {
                    NeedCard(need: need, onContribute: { donateNeed = $0 })
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 24)
        .navigationDestination(for: Need.self) { need in
            NeedDetailView(need: need)
        }
    }

    private var howItWorks: some View {
        VStack(alignment: .leading, spacing: 18) {
            SectionLabel(text: "The Process")
            Text("How It Works")
                .font(displayFont(30))
                .foregroundStyle(.white)
            step("01", "Browse verified needs", "Coaches, teachers, and administrators post specific funding needs. Each one is reviewed and verified before it goes live.")
            step("02", "Give to what moves you", "Choose the need that matters to you, give any amount once or monthly, and watch the bar move.")
            step("03", "Schools receive 88%", "Funds move through Childs Play Foundation, our 501(c)(3) fiscal sponsor. You get an official tax receipt, every time.")
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(LinearGradient(colors: [Heritage.navy, Heritage.navyDeep], startPoint: .top, endPoint: .bottom))
    }

    private func step(_ number: String, _ title: String, _ text: String) -> some View {
        HStack(alignment: .top, spacing: 14) {
            Text(number)
                .font(displayFont(28))
                .foregroundStyle(Heritage.goldLight)
                .frame(width: 46, alignment: .leading)
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.headline).foregroundStyle(.white)
                Text(text).font(.subheadline).foregroundStyle(.white.opacity(0.72))
            }
        }
    }

    private var leaderboardAndTrust: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 12) {
                SectionLabel(text: "Class Pride")
                Text("Class Year Leaderboard")
                    .font(displayFont(24))
                    .foregroundStyle(Heritage.navy)
                ForEach(Array(MockData.classYears.prefix(4).enumerated()), id: \.element.id) { index, standing in
                    HStack(spacing: 10) {
                        Text("\(index + 1)")
                            .font(displayFont(19))
                            .foregroundStyle(Heritage.gold)
                            .frame(width: 22)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Class of \(String(standing.year))").font(.subheadline.weight(.semibold)).foregroundStyle(Heritage.navy)
                            FundingBar(fraction: Double(standing.totalGiven) / Double(MockData.classYears[0].totalGiven))
                        }
                        Text(Money.whole(standing.totalGiven))
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(Heritage.navy)
                    }
                }
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Heritage.paper, in: RoundedRectangle(cornerRadius: 18))
            .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(Heritage.line, lineWidth: 1))
            .shadow(color: Heritage.navy.opacity(0.07), radius: 10, y: 4)

            VStack(alignment: .leading, spacing: 8) {
                SectionLabel(text: "Trust & Transparency")
                Text("Every dollar, accounted for.")
                    .font(displayFont(22))
                    .foregroundStyle(.white)
                trustLine("Fiscal sponsor", "Childs Play Foundation, Inc., a registered 501(c)(3), EIN 86-2707543")
                trustLine("88% to the school", "Fee structure published, always")
                trustLine("Verified needs only", "Staff identity and school affiliation confirmed before posting")
                trustLine("Tax receipts", "Issued for every gift, automatically")
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Heritage.navy, in: RoundedRectangle(cornerRadius: 18))
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 24)
    }

    private func trustLine(_ title: String, _ text: String) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(title).font(.subheadline.weight(.bold)).foregroundStyle(.white)
            Text(text).font(.caption).foregroundStyle(.white.opacity(0.72))
        }
        .padding(.vertical, 3)
    }

    private var founder: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image("HeroStudents")
                .resizable()
                .scaledToFill()
                .frame(height: 200)
                .clipped()
                .clipShape(RoundedRectangle(cornerRadius: 18))
            SectionLabel(text: "From the Founder")
            Text("Why I built AlumniUp")
                .font(displayFont(28))
                .foregroundStyle(Heritage.navy)
            Text("I am Risha Alexis, a graduate of Martin Luther King Jr. Senior High School. King High gave me the foundation to build a career in engineering and cybersecurity. But when I looked back, I saw coaches buying equipment out of their own pockets and programs struggling to survive.")
                .font(.body)
                .foregroundStyle(Heritage.ink)
                .lineSpacing(4)
            Text("AlumniUp is built for Detroit, by Detroit. Every dollar is accounted for, and every gift goes to the people shaping our kids.")
                .font(.body)
                .foregroundStyle(Heritage.ink)
                .lineSpacing(4)
            Text("Your alma mater needs you. Again.")
                .font(displayFont(20, weight: .semibold).italic())
                .foregroundStyle(Heritage.navy)
                .padding(.top, 2)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 24)
    }

    private var footerNote: some View {
        Text("Fiscal Sponsor: Childs Play Foundation, Inc. · 501(c)(3) EIN 86-2707543 · All donations tax-deductible · Detroit, MI")
            .font(.caption2)
            .foregroundStyle(.white.opacity(0.65))
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)
            .padding(20)
            .background(Heritage.navyDeep)
    }
}

#Preview {
    HomeView()
}
