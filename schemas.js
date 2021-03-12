const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html')
const passwordComplexity = require("joi-password-complexity")

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean
            }
        }
    }
})

const Joi = BaseJoi.extend(extension)

//escapeHTML means that the title location and description can't include HTML syntax
module.exports.hotelSchema = Joi.object({
    hotel: Joi.object({
        title: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        phone: Joi.number().required().min(0),
        start: Joi.string().required().escapeHTML(),
        end: Joi.string().required().escapeHTML(),
        amenities: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
})

module.exports.roomSchema = Joi.object({
    room: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML(),
        start: Joi.string().required().escapeHTML(),
        end: Joi.string().required().escapeHTML(),
        amenities: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})

const complexityOptions = {
    min: 5,
    max: 250,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 2,
  }

// module.exports.userSchema = Joi.object({
//     user: Joi.object({
//         fullName: Joi.string().required().escapeHTML(),
//         username: Joi.string().required().escapeHTML(),
//         email: Joi.string()
//         .lowercase()
//         .email({
//             minDomainSegments: 2,
//             tlds: {
//                allow: ["com", "net", "in", "co"],
//             },
//         },
//      Joi.string().alphanum().min(3).max(30)
//    ),
//    password: passwordComplexity(complexityOptions)
//   .required(),

//     }).required()
// })