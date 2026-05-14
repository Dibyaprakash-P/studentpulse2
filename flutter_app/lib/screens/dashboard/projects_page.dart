import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/neon_button.dart';

class ProjectsPage extends StatefulWidget {
  const ProjectsPage({super.key});
  @override
  State<ProjectsPage> createState() => _ProjectsPageState();
}

class _ProjectsPageState extends State<ProjectsPage> {
  final List<_Project> _projects = [
    _Project(
      title: 'Student Pulse App',
      description: 'AI-powered wellness analytics platform for students. Flutter + FastAPI.',
      deadline: DateTime.now().add(const Duration(days: 30)),
      status: 'In Progress',
      progress: 0.75,
      tags: ['Flutter', 'Python', 'ML'],
      files: ['proposal.pdf', 'wireframes.fig', 'backend_spec.md'],
    ),
    _Project(
      title: 'Data Structures Assignment',
      description: 'Implement AVL trees, Red-Black trees, and B-trees with analysis.',
      deadline: DateTime.now().add(const Duration(days: 10)),
      status: 'In Progress',
      progress: 0.4,
      tags: ['C++', 'Algorithms'],
      files: ['avl_tree.cpp', 'analysis.pdf'],
    ),
    _Project(
      title: 'Research Paper — AI in Education',
      description: 'Literature review on how AI is transforming modern education systems.',
      deadline: DateTime.now().add(const Duration(days: 45)),
      status: 'Planning',
      progress: 0.15,
      tags: ['Research', 'AI'],
      files: ['outline.docx'],
    ),
  ];

  void _addProject() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final tagCtrl = TextEditingController();
    DateTime deadline = DateTime.now().add(const Duration(days: 14));
    List<String> tags = [];
    List<String> files = [];
    final fileCtrl = TextEditingController();

    showDialog(context: context, builder: (ctx) => StatefulBuilder(
      builder: (ctx, setDlg) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return AlertDialog(
          backgroundColor: isDark ? AppColors.darkSurface2 : AppColors.lightSurface1,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text('New Project', style: Theme.of(context).textTheme.titleLarge),
          content: SizedBox(
            width: 420,
            child: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(controller: titleCtrl, decoration: const InputDecoration(hintText: 'Project title', prefixIcon: Icon(Icons.folder_rounded))),
                const SizedBox(height: 12),
                TextField(controller: descCtrl, maxLines: 3, minLines: 2, decoration: const InputDecoration(hintText: 'Description', alignLabelWithHint: true)),
                const SizedBox(height: 12),
                // Deadline
                GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(context: ctx, initialDate: deadline,
                      firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 730)));
                    if (picked != null) setDlg(() => deadline = picked);
                  },
                  child: InputDecorator(
                    decoration: const InputDecoration(hintText: 'Deadline', prefixIcon: Icon(Icons.calendar_today_rounded)),
                    child: Text('${deadline.day}/${deadline.month}/${deadline.year}', style: Theme.of(context).textTheme.bodyLarge),
                  ),
                ),
                const SizedBox(height: 12),
                // Tags
                Row(children: [
                  Expanded(child: TextField(controller: tagCtrl, decoration: const InputDecoration(hintText: 'Add tag'))),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: Icon(Icons.add_circle_rounded, color: AppColors.primary),
                    onPressed: () {
                      if (tagCtrl.text.trim().isNotEmpty) {
                        setDlg(() { tags.add(tagCtrl.text.trim()); tagCtrl.clear(); });
                      }
                    },
                  ),
                ]),
                if (tags.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Wrap(spacing: 6, runSpacing: 6, children: tags.map((t) => Chip(
                    label: Text(t, style: const TextStyle(fontSize: 12)),
                    deleteIcon: const Icon(Icons.close, size: 16),
                    onDeleted: () => setDlg(() => tags.remove(t)),
                    backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                    side: BorderSide.none,
                  )).toList()),
                ],
                const SizedBox(height: 12),
                // Files
                Row(children: [
                  Expanded(child: TextField(controller: fileCtrl, decoration: const InputDecoration(hintText: 'Add file name (any format)'))),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: Icon(Icons.attach_file_rounded, color: AppColors.accent),
                    onPressed: () {
                      if (fileCtrl.text.trim().isNotEmpty) {
                        setDlg(() { files.add(fileCtrl.text.trim()); fileCtrl.clear(); });
                      }
                    },
                  ),
                ]),
                if (files.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Wrap(spacing: 6, runSpacing: 6, children: files.map((f) => Chip(
                    label: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(_fileIcon(f), size: 14, color: _fileColor(f)),
                      const SizedBox(width: 6),
                      Text(f, style: const TextStyle(fontSize: 12)),
                    ]),
                    deleteIcon: const Icon(Icons.close, size: 16),
                    onDeleted: () => setDlg(() => files.remove(f)),
                    backgroundColor: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.05),
                    side: BorderSide.none,
                  )).toList()),
                ],
              ]),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                if (titleCtrl.text.trim().isEmpty) return;
                setState(() => _projects.insert(0, _Project(
                  title: titleCtrl.text.trim(),
                  description: descCtrl.text.trim(),
                  deadline: deadline,
                  status: 'Planning',
                  progress: 0.0,
                  tags: tags,
                  files: files,
                )));
                Navigator.pop(ctx);
              },
              child: const Text('Create'),
            ),
          ],
        );
      },
    ));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Header
      Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Projects', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text('${_projects.length} project${_projects.length == 1 ? '' : 's'} in progress', style: Theme.of(context).textTheme.bodyMedium),
        ])),
        NeonButton(text: 'New Project', icon: Icons.add_rounded, onPressed: _addProject),
      ]),
      const SizedBox(height: 24),

      if (_projects.isEmpty)
        GlassCard(padding: const EdgeInsets.all(40), child: Center(child: Column(children: [
          Icon(Icons.folder_open_rounded, size: 48, color: AppColors.accent.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text('No projects yet', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text('Create a new project to start tracking your work.', style: Theme.of(context).textTheme.bodyMedium),
        ])))
      else
        ...List.generate(_projects.length, (i) {
          final p = _projects[i];
          final daysLeft = p.deadline.difference(DateTime.now()).inDays;
          final statusCol = p.status == 'Completed' ? AppColors.success
              : p.status == 'In Progress' ? AppColors.primary : AppColors.warning;

          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                // Title row
                Row(children: [
                  Container(
                    width: 42, height: 42,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      gradient: LinearGradient(colors: [AppColors.primary.withValues(alpha: 0.2), AppColors.gradientEnd.withValues(alpha: 0.1)]),
                    ),
                    child: Icon(Icons.folder_special_rounded, color: AppColors.primary, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(p.title, style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 2),
                    Text(p.description, style: Theme.of(context).textTheme.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
                  ])),
                  // Status badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(color: statusCol.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: Text(p.status, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: statusCol)),
                  ),
                  const SizedBox(width: 8),
                  // Status cycle
                  PopupMenuButton<String>(
                    icon: Icon(Icons.more_vert_rounded, size: 20, color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim),
                    onSelected: (val) {
                      if (val == 'delete') { setState(() => _projects.removeAt(i)); return; }
                      setState(() {
                        p.status = val;
                        if (val == 'Completed') p.progress = 1.0;
                      });
                    },
                    itemBuilder: (_) => [
                      const PopupMenuItem(value: 'Planning', child: Text('Planning')),
                      const PopupMenuItem(value: 'In Progress', child: Text('In Progress')),
                      const PopupMenuItem(value: 'Completed', child: Text('Completed')),
                      const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: AppColors.danger))),
                    ],
                  ),
                ]),
                const SizedBox(height: 16),

                // Progress bar
                Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Text('Progress', style: TextStyle(fontSize: 12, color: isDark ? AppColors.darkTextDim : AppColors.lightTextDim)),
                      const Spacer(),
                      Text('${(p.progress * 100).round()}%', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    ]),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: p.progress, minHeight: 6,
                        backgroundColor: isDark ? AppColors.darkSurface3 : AppColors.lightSurface3,
                        valueColor: AlwaysStoppedAnimation(AppColors.primary),
                      ),
                    ),
                  ])),
                  const SizedBox(width: 20),
                  // Deadline
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.04),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.schedule_rounded, size: 16, color: daysLeft < 3 ? AppColors.danger : (isDark ? AppColors.darkTextDim : AppColors.lightTextDim)),
                      const SizedBox(width: 6),
                      Text(daysLeft <= 0 ? 'Due today' : '$daysLeft days left',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                          color: daysLeft < 3 ? AppColors.danger : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted))),
                    ]),
                  ),
                ]),
                const SizedBox(height: 14),

                // Tags and files
                Wrap(spacing: 6, runSpacing: 6, children: [
                  ...p.tags.map((t) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(t, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
                  )),
                  ...p.files.map((f) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.04),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(_fileIcon(f), size: 12, color: _fileColor(f)),
                      const SizedBox(width: 4),
                      Text(f, style: TextStyle(fontSize: 11, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted)),
                    ]),
                  )),
                ]),
              ]),
            ),
          );
        }),
    ]);
  }
}

IconData _fileIcon(String name) {
  final ext = name.split('.').last.toLowerCase();
  switch (ext) {
    case 'pdf': return Icons.picture_as_pdf_rounded;
    case 'doc': case 'docx': return Icons.description_rounded;
    case 'ppt': case 'pptx': return Icons.slideshow_rounded;
    case 'xls': case 'xlsx': case 'csv': return Icons.table_chart_rounded;
    case 'jpg': case 'png': case 'gif': case 'svg': return Icons.image_rounded;
    case 'mp4': case 'mov': case 'avi': return Icons.videocam_rounded;
    case 'zip': case 'rar': case '7z': return Icons.archive_rounded;
    case 'py': case 'js': case 'dart': case 'cpp': case 'java': return Icons.code_rounded;
    case 'fig': case 'sketch': case 'xd': return Icons.design_services_rounded;
    case 'md': return Icons.article_rounded;
    default: return Icons.insert_drive_file_rounded;
  }
}

Color _fileColor(String name) {
  final ext = name.split('.').last.toLowerCase();
  switch (ext) {
    case 'pdf': return AppColors.danger;
    case 'doc': case 'docx': return AppColors.primary;
    case 'ppt': case 'pptx': return AppColors.accent;
    case 'xls': case 'xlsx': case 'csv': return AppColors.success;
    case 'fig': case 'sketch': return Color(0xFF8B5CF6);
    case 'py': case 'js': case 'dart': return AppColors.warning;
    default: return AppColors.info;
  }
}

class _Project {
  String title, description, status;
  DateTime deadline;
  double progress;
  List<String> tags, files;
  _Project({
    required this.title, this.description = '', required this.deadline,
    this.status = 'Planning', this.progress = 0.0,
    this.tags = const [], this.files = const [],
  });
}
