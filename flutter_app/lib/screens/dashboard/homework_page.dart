import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/neon_button.dart';

class HomeworkPage extends StatefulWidget {
  const HomeworkPage({super.key});
  @override
  State<HomeworkPage> createState() => _HomeworkPageState();
}

class _HomeworkPageState extends State<HomeworkPage> {
  final List<_Homework> _items = [
    _Homework(title: 'Linear Algebra Assignment', subject: 'Mathematics', deadline: DateTime.now().add(const Duration(days: 2)), priority: 'High'),
    _Homework(title: 'Essay on Climate Change', subject: 'Environmental Science', deadline: DateTime.now().add(const Duration(days: 5)), priority: 'Medium', completed: true),
    _Homework(title: 'Physics Lab Report', subject: 'Physics', deadline: DateTime.now().add(const Duration(days: 1)), priority: 'High'),
    _Homework(title: 'Read Chapter 7-9', subject: 'History', deadline: DateTime.now().add(const Duration(days: 7)), priority: 'Low'),
  ];

  String _filter = 'All';

  List<_Homework> get _filtered {
    if (_filter == 'Pending') return _items.where((h) => !h.completed).toList();
    if (_filter == 'Completed') return _items.where((h) => h.completed).toList();
    return _items;
  }

  void _addHomework() {
    final titleCtrl = TextEditingController();
    final subjectCtrl = TextEditingController();
    DateTime deadline = DateTime.now().add(const Duration(days: 3));
    String priority = 'Medium';

    showDialog(context: context, builder: (ctx) => StatefulBuilder(
      builder: (ctx, setDlg) => AlertDialog(
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? AppColors.darkSurface2 : AppColors.lightSurface1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Add Homework', style: Theme.of(context).textTheme.titleLarge),
        content: SizedBox(
          width: 380,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: titleCtrl, decoration: const InputDecoration(hintText: 'Title', prefixIcon: Icon(Icons.assignment_rounded))),
            const SizedBox(height: 12),
            TextField(controller: subjectCtrl, decoration: const InputDecoration(hintText: 'Subject', prefixIcon: Icon(Icons.school_rounded))),
            const SizedBox(height: 12),
            // Deadline picker
            GestureDetector(
              onTap: () async {
                final picked = await showDatePicker(
                  context: ctx, initialDate: deadline,
                  firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)),
                );
                if (picked != null) setDlg(() => deadline = picked);
              },
              child: InputDecorator(
                decoration: const InputDecoration(hintText: 'Deadline', prefixIcon: Icon(Icons.calendar_today_rounded)),
                child: Text('${deadline.day}/${deadline.month}/${deadline.year}',
                    style: Theme.of(context).textTheme.bodyLarge),
              ),
            ),
            const SizedBox(height: 12),
            // Priority selector
            Row(children: ['Low', 'Medium', 'High'].map((p) {
              final sel = priority == p;
              final col = p == 'High' ? AppColors.danger : p == 'Medium' ? AppColors.warning : AppColors.success;
              return Expanded(child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: GestureDetector(
                  onTap: () => setDlg(() => priority = p),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: sel ? col.withValues(alpha: 0.15) : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: sel ? col : Theme.of(context).dividerColor),
                    ),
                    child: Text(p, textAlign: TextAlign.center, style: TextStyle(
                      fontSize: 13, fontWeight: sel ? FontWeight.w700 : FontWeight.w500, color: sel ? col : null,
                    )),
                  ),
                ),
              ));
            }).toList()),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (titleCtrl.text.trim().isEmpty) return;
              setState(() => _items.insert(0, _Homework(
                title: titleCtrl.text.trim(),
                subject: subjectCtrl.text.trim().isEmpty ? 'General' : subjectCtrl.text.trim(),
                deadline: deadline,
                priority: priority,
              )));
              Navigator.pop(ctx);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final pending = _items.where((h) => !h.completed).length;

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Header
      Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Homework Tracker', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text('$pending pending · ${_items.length - pending} completed', style: Theme.of(context).textTheme.bodyMedium),
        ])),
        NeonButton(text: 'Add', icon: Icons.add_rounded, onPressed: _addHomework),
      ]),
      const SizedBox(height: 20),

      // Filter chips
      Row(children: ['All', 'Pending', 'Completed'].map((f) {
        final sel = _filter == f;
        return Padding(
          padding: const EdgeInsets.only(right: 8),
          child: GestureDetector(
            onTap: () => setState(() => _filter = f),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: sel ? AppColors.primary.withValues(alpha: 0.12) : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: sel ? AppColors.primary : Theme.of(context).dividerColor),
              ),
              child: Text(f, style: TextStyle(
                fontSize: 13, fontWeight: sel ? FontWeight.w600 : FontWeight.w500,
                color: sel ? AppColors.primary : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
              )),
            ),
          ),
        );
      }).toList()),
      const SizedBox(height: 20),

      // Homework list
      if (_filtered.isEmpty)
        GlassCard(padding: const EdgeInsets.all(40), child: Center(child: Column(children: [
          Icon(Icons.check_circle_outline_rounded, size: 48, color: AppColors.success.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text('No homework here!', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text('Add new homework with the button above.', style: Theme.of(context).textTheme.bodyMedium),
        ])))
      else
        ...List.generate(_filtered.length, (i) {
          final h = _filtered[i];
          final daysLeft = h.deadline.difference(DateTime.now()).inDays;
          final overdue = daysLeft < 0;
          final priorityCol = h.priority == 'High' ? AppColors.danger : h.priority == 'Medium' ? AppColors.warning : AppColors.success;

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GlassCard(
              padding: const EdgeInsets.all(16),
              borderColor: h.completed ? AppColors.success.withValues(alpha: 0.3) : (overdue ? AppColors.danger.withValues(alpha: 0.3) : null),
              child: Row(children: [
                // Checkbox
                GestureDetector(
                  onTap: () => setState(() => h.completed = !h.completed),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 28, height: 28,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: h.completed ? AppColors.success : Colors.transparent,
                      border: Border.all(color: h.completed ? AppColors.success : Theme.of(context).dividerColor, width: 2),
                    ),
                    child: h.completed ? const Icon(Icons.check_rounded, size: 18, color: Colors.white) : null,
                  ),
                ),
                const SizedBox(width: 14),
                // Content
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(h.title, style: TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 15,
                    decoration: h.completed ? TextDecoration.lineThrough : null,
                    color: h.completed ? (isDark ? AppColors.darkTextDim : AppColors.lightTextDim) : null,
                  )),
                  const SizedBox(height: 4),
                  Wrap(spacing: 12, children: [
                    Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.school_rounded, size: 14, color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim),
                      const SizedBox(width: 4),
                      Text(h.subject, style: Theme.of(context).textTheme.bodySmall),
                    ]),
                    Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.calendar_today_rounded, size: 14,
                          color: overdue && !h.completed ? AppColors.danger : (isDark ? AppColors.darkTextDim : AppColors.lightTextDim)),
                      const SizedBox(width: 4),
                      Text(
                        overdue && !h.completed ? 'Overdue (${-daysLeft}d ago)'
                            : daysLeft == 0 ? 'Due today' : '$daysLeft day${daysLeft == 1 ? '' : 's'} left',
                        style: TextStyle(fontSize: 12,
                          color: overdue && !h.completed ? AppColors.danger : (isDark ? AppColors.darkTextDim : AppColors.lightTextDim),
                          fontWeight: overdue && !h.completed ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ]),
                  ]),
                ])),
                // Priority tag
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: priorityCol.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(h.priority, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: priorityCol)),
                ),
                // Delete
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => setState(() => _items.remove(h)),
                  child: Icon(Icons.delete_outline_rounded, size: 20, color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim),
                ),
              ]),
            ),
          );
        }),
    ]);
  }
}

class _Homework {
  String title, subject, priority;
  DateTime deadline;
  bool completed;
  _Homework({required this.title, required this.subject, required this.deadline, this.priority = 'Medium', this.completed = false});
}
