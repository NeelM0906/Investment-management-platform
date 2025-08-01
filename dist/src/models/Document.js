"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileIcon = exports.MAX_FILE_SIZE = exports.SUPPORTED_FILE_TYPES = void 0;
exports.SUPPORTED_FILE_TYPES = {
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'application/rtf': '.rtf',
    'application/vnd.oasis.opendocument.text': '.odt',
    'application/vnd.oasis.opendocument.spreadsheet': '.ods',
    'application/vnd.oasis.opendocument.presentation': '.odp',
    'text/csv': '.csv',
    'text/markdown': '.md',
    'application/json': '.json',
    'text/xml': '.xml',
    'application/xml': '.xml'
};
exports.MAX_FILE_SIZE = 10 * 1024 * 1024;
const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf'))
        return '📄';
    if (mimeType.includes('word') || mimeType.includes('document'))
        return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
        return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
        return '📋';
    if (mimeType.includes('text'))
        return '📃';
    if (mimeType.includes('image'))
        return '🖼️';
    return '📁';
};
exports.getFileIcon = getFileIcon;
//# sourceMappingURL=Document.js.map