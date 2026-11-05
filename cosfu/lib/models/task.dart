class Task {
  String id;
  String title;
  bool isCompleted;

  Task({required this.id, required this.title, this.isCompleted = false});

  Map<String, dynamic> toMap() => {
        'id': id,
        'title': title,
        'isCompleted': isCompleted,
      };

  factory Task.fromMap(Map<String, dynamic> map) => Task(
        id: map['id'] ?? '',
        title: map['title'] ?? '',
        isCompleted: map['isCompleted'] ?? false,
      );
}
