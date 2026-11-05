class UserProfile {
  int credits;
  int streakDays;
  String? lastActiveDate; // yyyy-MM-dd

  UserProfile({
    this.credits = 0,
    this.streakDays = 0,
    this.lastActiveDate,
  });
}
