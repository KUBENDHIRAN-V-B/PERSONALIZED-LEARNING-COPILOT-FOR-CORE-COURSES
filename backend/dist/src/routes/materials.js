"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const materialsStore = new Map();
// Upload material
router.post('/upload', (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { courseId, fileName, fileType, content } = req.body;
        if (!courseId || !fileName || !content) {
            return res.status(400).json({ error: 'Missing required fields: courseId, fileName, content' });
        }
        // Validate file type
        const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(fileType)) {
            return res.status(400).json({ error: 'Unsupported file type. Allowed: PDF, TXT, MD, DOC, DOCX' });
        }
        // Validate file size (max 10MB)
        const fileSizeInMB = Buffer.byteLength(content, 'utf8') / (1024 * 1024);
        if (fileSizeInMB > 10) {
            return res.status(400).json({ error: 'File size exceeds 10MB limit' });
        }
        const material = {
            id: `mat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            courseId,
            fileName,
            fileType,
            fileSize: Buffer.byteLength(content, 'utf8'),
            content,
            uploadedAt: new Date(),
            lastModified: new Date(),
        };
        if (!materialsStore.has(userId)) {
            materialsStore.set(userId, []);
        }
        materialsStore.get(userId).push(material);
        res.status(201).json({
            message: 'Material uploaded successfully',
            material: {
                id: material.id,
                fileName: material.fileName,
                fileType: material.fileType,
                fileSize: material.fileSize,
                uploadedAt: material.uploadedAt,
            },
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload material' });
    }
});
// Get all materials for user
router.get('/', (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { courseId } = req.query;
        let materials = materialsStore.get(userId) || [];
        if (courseId) {
            materials = materials.filter(m => m.courseId === courseId);
        }
        const materialsList = materials.map(m => ({
            id: m.id,
            courseId: m.courseId,
            fileName: m.fileName,
            fileType: m.fileType,
            fileSize: m.fileSize,
            uploadedAt: m.uploadedAt,
            lastModified: m.lastModified,
        }));
        res.json({
            materials: materialsList,
            count: materialsList.length,
        });
    }
    catch (error) {
        console.error('Failed to fetch materials:', error);
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});
// Get specific material
router.get('/:materialId', (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { materialId } = req.params;
        const materials = materialsStore.get(userId) || [];
        const material = materials.find(m => m.id === materialId);
        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }
        res.json({
            id: material.id,
            courseId: material.courseId,
            fileName: material.fileName,
            fileType: material.fileType,
            fileSize: material.fileSize,
            content: material.content,
            uploadedAt: material.uploadedAt,
            lastModified: material.lastModified,
        });
    }
    catch (error) {
        console.error('Failed to fetch material:', error);
        res.status(500).json({ error: 'Failed to fetch material' });
    }
});
// Delete material
router.delete('/:materialId', (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { materialId } = req.params;
        const materials = materialsStore.get(userId) || [];
        const index = materials.findIndex(m => m.id === materialId);
        if (index === -1) {
            return res.status(404).json({ error: 'Material not found' });
        }
        const deleted = materials.splice(index, 1)[0];
        res.json({
            message: 'Material deleted successfully',
            deletedMaterial: {
                id: deleted.id,
                fileName: deleted.fileName,
            },
        });
    }
    catch (error) {
        console.error('Failed to delete material:', error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
});
// Search materials by content
router.post('/search', (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { query, courseId } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        let materials = materialsStore.get(userId) || [];
        if (courseId) {
            materials = materials.filter(m => m.courseId === courseId);
        }
        const searchTerm = query.toLowerCase();
        const results = materials.filter(m => m.fileName.toLowerCase().includes(searchTerm) ||
            m.content.toLowerCase().includes(searchTerm));
        res.json({
            query,
            results: results.map(m => ({
                id: m.id,
                courseId: m.courseId,
                fileName: m.fileName,
                fileType: m.fileType,
                uploadedAt: m.uploadedAt,
                relevance: calculateRelevance(m.content, searchTerm),
            })),
            count: results.length,
        });
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search materials' });
    }
});
function calculateRelevance(content, query) {
    const lowerContent = content.toLowerCase();
    const matches = (lowerContent.match(new RegExp(query, 'g')) || []).length;
    return Math.min(100, matches * 10);
}
exports.default = router;
//# sourceMappingURL=materials.js.map