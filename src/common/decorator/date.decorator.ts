import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isBefore', async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    const comparisonValue = args.constraints[0];
    let comparisonTime =
      comparisonValue !== 'now'
        ? new Date(args.object[args.constraints[0]])
        : toLocalTime(new Date());

    return new Date(propertyValue) > comparisonTime;
  }

  defaultMessage(args: ValidationArguments) {
    return `"${args.property}" must be after "${args.constraints[0]}"`;
  }
}

export const toLocalTime = (time: Date | string) => {
  let d = new Date(time);
  let offset = new Date().getTimezoneOffset() * 60000;
  if (offset < 0) return new Date(d.getTime() - offset);
  else return new Date(d.getTime() + offset);
};

export const toUtcTime = (time: Date | string) => {
  let d = new Date(time);
  let offset = new Date().getTimezoneOffset() * 60000;
  console.log(d, offset);
  if (offset < 0) return new Date(d.getTime() + offset);
  else return new Date(d.getTime() - offset);
};
