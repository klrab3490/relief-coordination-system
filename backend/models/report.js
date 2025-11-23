const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: 3,
            maxlength: 100
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: 10,
            maxlength: 500
        },
        category: {
            type: String,
            enum: ["fire", "flood", "accident", "earthquake", "landslide", "storm", "other"],
            required: [true, 'Category is required'],
        },
        status: {
            type: String,
            enum: ["reported", "reviewing", "assigned", "resolving", "resolved"],
            default: "reported"
        },
        imageUrl: {
            type: String,
            default: null
        },
        location:{
            type:{
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates:{
                type: [Number],
                required: true,
                validate: {
                    validator: function(value) {
                        return value.length === 2;
                    },
                    message: 'Coordinates must be an array of two numbers [longitude, latitude]'
                }
            }   
        },
        reportedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Indexed for performance
ReportSchema.index({ location: '2dsphere' });
ReportSchema.index({ status: 1 });
ReportSchema.index({ category: 1 });

module.exports = mongoose.model('Report', ReportSchema);