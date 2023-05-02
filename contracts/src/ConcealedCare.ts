import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Poseidon,
  Bool,
  Struct,
} from 'snarkyjs';

export class Report extends Struct({
  patientIdHash: Field,
  validUntil: Field,
  bloodPressure: Field,
  hasConditionA: Bool,
  hasConditionB: Bool,
  hasConditionC: Bool,
}) {}

export class Requirements extends Struct({
  patientIdHash: Field,
  verifyTime: Field,
  minBloodPressure: Field,
  maxBloodPressure: Field,
  allowConditionA: Bool,
  allowConditionB: Bool,
  allowConditionC: Bool,
}) {}

function hashReport(report: Report) {
  return Poseidon.hash(Report.toFields(report));
}

export class ConcealedCare extends SmartContract {
  events = {
    verified: Field,
  };

  @state(Field) reportHash = State<Field>();
  @state(Field) verifiedRequirementsHash = State<Field>();

  init() {
    super.init();
    this.reportHash.set(Field(0));
    this.verifiedRequirementsHash.set(Field(0));
  }

  // doctor calls this method to set the medical report
  @method publishReport(report: Report) {
    this.reportHash.set(hashReport(report));
  }

  // patient calls this method to publish proof of meeting the requirements for an accommodation
  @method publishAccommodationProof(
    report: Report,
    requirementsToCheck: Requirements
  ) {
    const hash = hashReport(report);

    this.reportHash.assertEquals(hash);

    report.patientIdHash.assertEquals(requirementsToCheck.patientIdHash);

    requirementsToCheck.verifyTime.assertLessThanOrEqual(report.validUntil);

    report.bloodPressure.assertGreaterThanOrEqual(
      requirementsToCheck.minBloodPressure
    );
    report.bloodPressure.assertLessThanOrEqual(
      requirementsToCheck.maxBloodPressure
    );

    requirementsToCheck.allowConditionA
      .and(report.hasConditionA)
      .or(requirementsToCheck.allowConditionB.and(report.hasConditionB))
      .or(requirementsToCheck.allowConditionC.and(report.hasConditionC))
      .assertTrue();

    this.verifiedRequirementsHash.set(
      Poseidon.hash([
        new Field(requirementsToCheck.patientIdHash),
        new Field(requirementsToCheck.verifyTime),
        new Field(requirementsToCheck.minBloodPressure),
        new Field(requirementsToCheck.maxBloodPressure),
        new Bool(requirementsToCheck.allowConditionA).toField(),
        new Bool(requirementsToCheck.allowConditionB).toField(),
        new Bool(requirementsToCheck.allowConditionC).toField(),
      ])
    );
  }

  // employer calls this method to verify that the requested requirements are met
  @method verifyAccommodationProof(requirementsToCheck: Requirements) {
    const requirementsHashToCheck = Poseidon.hash(
      [
        new Field(requirementsToCheck.patientIdHash),
        new Field(requirementsToCheck.verifyTime),
        new Field(requirementsToCheck.minBloodPressure),
        new Field(requirementsToCheck.maxBloodPressure),
        new Bool(requirementsToCheck.allowConditionA).toField(),
        new Bool(requirementsToCheck.allowConditionB).toField(),
        new Bool(requirementsToCheck.allowConditionC).toField(),
      ]
    );

    const currentRequirementsHash = this.verifiedRequirementsHash.get()

    // console.log('incoming requirements hash: ', requirementsHashToCheck)
    // console.log('current requirements hash: ', currentRequirementsHash)

    currentRequirementsHash.assertGreaterThan(Field(0));
    this.verifiedRequirementsHash.assertEquals(requirementsHashToCheck);

    this.emitEvent('verified', requirementsHashToCheck);
  }
}
