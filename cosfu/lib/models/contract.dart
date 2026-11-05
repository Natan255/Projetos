class Contract {
  final String id;
  final String title;
  final String description;
  final String reward;
  final String penalty;
  bool isAccepted;

  Contract({
    required this.id,
    required this.title,
    required this.description,
    required this.reward,
    required this.penalty,
    this.isAccepted = false,
  });
}
