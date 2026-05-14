import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/neon_button.dart';

class NotesPage extends StatefulWidget {
  const NotesPage({super.key});
  @override
  State<NotesPage> createState() => _NotesPageState();
}

class _NotesPageState extends State<NotesPage> {
  final List<_Note> _notes = [
    _Note(title: 'Lecture: Quantum Mechanics', body: 'Wave-particle duality — photons exhibit both wave and particle behavior.\n\nKey equations:\n• E = hf\n• λ = h/p\n\nRemember: double-slit experiment for exam.', color: AppColors.primary, pinned: true),
    _Note(title: 'Study Group — Friday', body: 'Meet at library 3rd floor at 4 PM.\nBring: Calculus textbook, laptop.', color: AppColors.accent),
    _Note(title: 'Exam Prep Checklist', body: '☑ Review chapters 1-5\n☐ Practice problems set B\n☐ Flashcards for terminology\n☐ Past papers 2024-2025', color: AppColors.success),
    _Note(title: 'Project Ideas', body: '1. Student wellness app (doing this!)\n2. AI-powered flashcard generator\n3. Campus navigation system', color: Color(0xFF8B5CF6)),
  ];

  void _addNote() {
    final titleCtrl = TextEditingController();
    final bodyCtrl = TextEditingController();
    Color selectedColor = AppColors.primary;
    final colors = [AppColors.primary, AppColors.accent, AppColors.success, Color(0xFF8B5CF6), AppColors.warning, AppColors.danger];

    showDialog(context: context, builder: (ctx) => StatefulBuilder(
      builder: (ctx, setDlg) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return AlertDialog(
          backgroundColor: isDark ? AppColors.darkSurface2 : AppColors.lightSurface1,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text('New Note', style: Theme.of(context).textTheme.titleLarge),
          content: SizedBox(
            width: 400,
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: titleCtrl, decoration: const InputDecoration(hintText: 'Title', prefixIcon: Icon(Icons.title_rounded))),
              const SizedBox(height: 12),
              TextField(
                controller: bodyCtrl, maxLines: 6, minLines: 3,
                decoration: const InputDecoration(hintText: 'Write your note here...', alignLabelWithHint: true),
              ),
              const SizedBox(height: 16),
              // Color picker
              Row(children: [
                Text('Color: ', style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(width: 8),
                ...colors.map((c) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () => setDlg(() => selectedColor = c),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 28, height: 28,
                      decoration: BoxDecoration(
                        color: c,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: selectedColor == c ? Colors.white : Colors.transparent, width: 2),
                        boxShadow: selectedColor == c ? AppShadows.glow(c) : null,
                      ),
                    ),
                  ),
                )),
              ]),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                if (titleCtrl.text.trim().isEmpty) return;
                setState(() => _notes.insert(0, _Note(
                  title: titleCtrl.text.trim(),
                  body: bodyCtrl.text.trim(),
                  color: selectedColor,
                )));
                Navigator.pop(ctx);
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    ));
  }

  void _editNote(int index) {
    final note = _notes[index];
    final titleCtrl = TextEditingController(text: note.title);
    final bodyCtrl = TextEditingController(text: note.body);

    showDialog(context: context, builder: (ctx) {
      final isDark = Theme.of(context).brightness == Brightness.dark;
      return AlertDialog(
        backgroundColor: isDark ? AppColors.darkSurface2 : AppColors.lightSurface1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Edit Note', style: Theme.of(context).textTheme.titleLarge),
        content: SizedBox(
          width: 400,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: titleCtrl, decoration: const InputDecoration(hintText: 'Title')),
            const SizedBox(height: 12),
            TextField(controller: bodyCtrl, maxLines: 6, minLines: 3, decoration: const InputDecoration(hintText: 'Note content...')),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              setState(() {
                note.title = titleCtrl.text.trim();
                note.body = bodyCtrl.text.trim();
              });
              Navigator.pop(ctx);
            },
            child: const Text('Save'),
          ),
        ],
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Header
      Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Notes', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text('${_notes.length} note${_notes.length == 1 ? '' : 's'}', style: Theme.of(context).textTheme.bodyMedium),
        ])),
        NeonButton(text: 'New Note', icon: Icons.add_rounded, onPressed: _addNote),
      ]),
      const SizedBox(height: 24),

      if (_notes.isEmpty)
        GlassCard(padding: const EdgeInsets.all(40), child: Center(child: Column(children: [
          Icon(Icons.note_alt_outlined, size: 48, color: AppColors.primary.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text('No notes yet', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text('Create your first note to get started.', style: Theme.of(context).textTheme.bodyMedium),
        ])))
      else
        LayoutBuilder(builder: (context, constraints) {
          final crossCount = constraints.maxWidth > 800 ? 3 : constraints.maxWidth > 500 ? 2 : 1;
          return GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossCount,
              crossAxisSpacing: 16, mainAxisSpacing: 16,
              childAspectRatio: 1.3,
            ),
            itemCount: _notes.length,
            itemBuilder: (_, i) => _noteCard(context, isDark, i),
          );
        }),
    ]);
  }

  Widget _noteCard(BuildContext context, bool isDark, int index) {
    final n = _notes[index];
    return GestureDetector(
      onTap: () => _editNote(index),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface2 : AppColors.lightSurface1,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
          boxShadow: AppShadows.card(isDark),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Top bar with color strip and actions
          Row(children: [
            Container(width: 4, height: 20, decoration: BoxDecoration(color: n.color, borderRadius: BorderRadius.circular(2))),
            const SizedBox(width: 10),
            Expanded(child: Text(n.title, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15), maxLines: 1, overflow: TextOverflow.ellipsis)),
            GestureDetector(
              onTap: () => setState(() => n.pinned = !n.pinned),
              child: Icon(n.pinned ? Icons.push_pin_rounded : Icons.push_pin_outlined, size: 18,
                color: n.pinned ? AppColors.accent : (isDark ? AppColors.darkTextDim : AppColors.lightTextDim)),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => setState(() => _notes.removeAt(index)),
              child: Icon(Icons.delete_outline_rounded, size: 18, color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim),
            ),
          ]),
          const SizedBox(height: 12),
          // Body preview
          Expanded(
            child: Text(
              n.body.isEmpty ? 'Empty note' : n.body,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
              maxLines: 6, overflow: TextOverflow.fade,
            ),
          ),
          const SizedBox(height: 8),
          // Timestamp
          Text(
            'Edited ${_formatTime(n.updatedAt)}',
            style: TextStyle(fontSize: 11, color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim),
          ),
        ]),
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}

class _Note {
  String title, body;
  Color color;
  bool pinned;
  DateTime updatedAt;
  _Note({required this.title, this.body = '', this.color = AppColors.primary, this.pinned = false})
      : updatedAt = DateTime.now();
}
