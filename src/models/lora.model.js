const mongoose = require("mongoose");
const { toJSON } = require("./plugins");
const { loraStatus } = require("../config/loras");

const loraSchema = mongoose.Schema(
  {
    lora: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        loraStatus.CREATED,
        loraStatus.PROCESSING,
        loraStatus.PROCESS_FAILED,
        loraStatus.SUSPENDED,
        loraStatus.REMOVED,
      ],
      required: true,
    },
    usedCnt:{
      type: Number,
      required : false,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
loraSchema.plugin(toJSON);

/**
 * @typedef Lora
 */
const Lora = mongoose.model("Lora", loraSchema);

module.exports = Lora;
