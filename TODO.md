# TODO - Multi-slot selection feature

## Plan items

- [ ] Update SlotSelector to support fixed 12-hour Indian times + multi-select (Select All, OK)
- [ ] Update AppointmentForm to submit multiple selected times and create multiple appointments + mark multiple slots unavailable
- [ ] Update email payload (one email listing all times)
- [ ] Validate Firestore slot lookup uses the exact `time` string format stored in DB
- [ ] Run dev/build and smoke test booking flow
