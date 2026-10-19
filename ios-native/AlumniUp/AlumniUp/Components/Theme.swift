import SwiftUI

/// AlumniUp "Heritage Premium" design system (approved by Risha,
/// October 19, 2026): the university advancement look. Deep navy,
/// antique gold, warm cream, editorial serif headlines, photography
/// first. Per Risha's standing Apple rule (October 13, 2026), Apple
/// platform UI uses the Liquid Glass effect for buttons and other
/// functional elements, following Apple's Human Interface Guidelines:
/// glass lives on the functional layer, content stays on solid
/// surfaces so text is always legible, and tap targets are at least
/// 44 points.
enum Heritage {
    static let navy = Color(red: 0.059, green: 0.122, blue: 0.220)       // #0F1F38
    static let navyDeep = Color(red: 0.039, green: 0.086, blue: 0.157)   // #0A1628
    static let gold = Color(red: 0.722, green: 0.533, blue: 0.165)       // #B8882A
    static let goldLight = Color(red: 0.831, green: 0.659, blue: 0.306)  // #D4A84E
    static let cream = Color(red: 0.973, green: 0.969, blue: 0.961)      // #F8F7F5
    static let paper = Color(red: 1.000, green: 0.992, blue: 0.976)      // #FFFDF9
    static let green = Color(red: 0.106, green: 0.420, blue: 0.259)      // #1B6B42
    static let greenBg = Color(red: 0.906, green: 0.949, blue: 0.925)
    static let ink = Color(red: 0.133, green: 0.188, blue: 0.290)
    static let muted = Color(red: 0.408, green: 0.451, blue: 0.541)
    static let line = Color(red: 0.894, green: 0.871, blue: 0.812)
}

extension Color {
    static let heritageNavy = Heritage.navy
    static let heritageGold = Heritage.gold
    static let heritageCream = Heritage.cream
}

/// Serif display font for headlines (New York on Apple platforms,
/// the system counterpart to the web app's Cormorant Garamond).
func displayFont(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
    .system(size: size, weight: weight, design: .serif)
}

/// Small-caps gold section label used across screens.
struct SectionLabel: View {
    let text: String
    var body: some View {
        Text(text.uppercased())
            .font(.caption.weight(.bold))
            .tracking(2.2)
            .foregroundStyle(Heritage.gold)
    }
}

/// Money formatting: $3,200 and $50.00 style, USD.
enum Money {
    static func whole(_ value: Int) -> String {
        value.formatted(.currency(code: "USD").precision(.fractionLength(0)))
    }
}
