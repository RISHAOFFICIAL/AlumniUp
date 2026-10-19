# AlumniUp for iOS (SwiftUI)

The native iPhone version of AlumniUp, built in the **Heritage Premium**
design approved October 19, 2026 (the same design as the web mockups in
`../../design-mockups/`). SwiftUI, iOS 26, Liquid Glass on the
functional layer per Apple's Human Interface Guidelines.

## What is in this build

- **Home:** photo hero with the "Your alma mater needs you. Again."
  headline, floating featured need, platform stats, photo-first need
  cards, navy How It Works, Class Year Leaderboard with the Trust &
  Transparency panel, and the founder story.
- **Need detail:** full story, funding bar, minimum-to-begin note,
  fee split, and the Donate flow.
- **Donation sheet:** amount chips ($25 to $1,000 or custom),
  one-time or monthly, donor details, anonymous option, Wall of
  Honor message, and the 88% fee transparency box.
- **Wall of Honor:** class year leaderboard and recognized supporters.
- **For Schools:** audience cards, verification steps, Founding
  Partner ($99/yr) and Standard ($129/yr) pricing, registration form.

Data is **sample data** (the same mock data as the web preview), and
the Donate and Register flows end at confirmation screens. No payment
is processed and nothing is submitted in this build.

## Open it in Xcode (Risha's steps)

1. Pull the latest repo: in Terminal, `cd` to your AlumniUp folder and
   run `git pull` (or clone `RISHAOFFICIAL/AlumniUp` fresh).
2. Open `ios-native/AlumniUp/AlumniUp.xcodeproj` in Xcode 26.
3. Pick an iPhone simulator at the top (for example iPhone 17 Pro).
4. Press the Run button (triangle) or Cmd+R. The app builds and opens
   in the simulator.

Running in the simulator is free with your Apple ID; just sign in
under Xcode Settings, Accounts, if Xcode asks. The $99 Apple Developer
Program is only needed later for TestFlight and the App Store.

## Notes

- Bundle ID: `com.hghmanagementgroup.alumniup`
- Photos in this build are stand-ins. Before any public release they
  get swapped for real photos of the schools and needs.
- This machine (Muse's) has no Xcode, so this project has not been
  compile-tested yet. If the first build shows errors, copy the error
  list to Muse and a fix pass follows, the same loop we planned for
  Parking Ticket Fighter.
