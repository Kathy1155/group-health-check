export class CreateReservationDto {
  groupCode: string;
  idNumber: string;
  packageId: number;
  slotId: number;
  medicalProfile: {
    bloodType: string;
    allergies: string;
    familyHistory: string;
    chronicDiseases: string;
    medications: string;
  };
}