import assert from "node:assert/strict";
import { getSolapiFailureDetails } from "../lib/sms.js";

const unregisteredSender = getSolapiFailureDetails({
  failedMessageList: [{ statusCode: "1062", statusMessage: "발신번호 미등록" }],
});
assert.equal(unregisteredSender?.reason, "unregistered_sender");
assert.equal(unregisteredSender?.providerCode, "1062");

const rejectedGroup = getSolapiFailureDetails({
  groupInfo: {
    count: { total: 1, registeredSuccess: 0, registeredFailed: 1 },
  },
});
assert.equal(rejectedGroup?.reason, "sms_send_failed");

const acceptedGroup = getSolapiFailureDetails({
  groupInfo: {
    count: { total: 1, registeredSuccess: 1, registeredFailed: 0 },
  },
});
assert.equal(acceptedGroup, null);

console.log("SMS provider response regression passed.");
