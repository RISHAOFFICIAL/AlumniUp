import SwiftUI

/// Root tab bar. On iOS 26 the tab bar itself is Liquid Glass by
/// default, which keeps the app's functional chrome on glass while
/// content stays on solid Heritage surfaces.
struct ContentView: View {
    var body: some View {
        TabView {
            Tab("Home", systemImage: "house.fill") {
                HomeView()
            }
            Tab("Wall of Honor", systemImage: "trophy.fill") {
                WallOfHonorView()
            }
            Tab("For Schools", systemImage: "building.columns.fill") {
                ForSchoolsView()
            }
        }
        .tint(Heritage.gold)
    }
}

#Preview {
    ContentView()
}
