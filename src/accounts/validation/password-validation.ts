import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { validatePassword } from 'helpers/auth.helpers';

@ValidatorConstraint({ name: 'customText', async: false })
export class PasswordValidation implements ValidatorConstraintInterface {
  validate(text: string) {
    return validatePassword(text);
  }

  defaultMessage() {
    return 'Enter correct password due to rules';
  }
}
