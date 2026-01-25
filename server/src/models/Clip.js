import mongoose from 'mongoose';

const TTL_SECONDS = parseInt(process.env.CLIP_TTL_SECONDS) || 900; // 15 minutes default

const clipSchema = new mongoose.Schema({
    clipboardId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    content: {
        type: String,
        required: true,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: TTL_SECONDS } // TTL based on creation time only
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    creatorTokenHash: {
        type: String,
        required: true
    },
    meta: {
        sizeBytes: {
            type: Number,
            default: 0
        }
    }
});

// Update sizeBytes before saving
clipSchema.pre('save', function (next) {
    this.meta.sizeBytes = Buffer.byteLength(this.content, 'utf8');
    next();
});

// Static method to get clip (no TTL reset)
clipSchema.statics.getClip = async function (clipboardId) {
    return this.findOne({ clipboardId });
};

// Static method to update content (no TTL reset)
clipSchema.statics.updateContent = async function (clipboardId, content) {
    const sizeBytes = Buffer.byteLength(content, 'utf8');
    return this.findOneAndUpdate(
        { clipboardId },
        {
            content,
            lastUpdated: new Date(),
            'meta.sizeBytes': sizeBytes
        },
        { new: true }
    );
};

const Clip = mongoose.model('Clip', clipSchema);

export default Clip;
