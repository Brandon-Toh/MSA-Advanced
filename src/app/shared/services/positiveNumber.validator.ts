import { AbstractControl, ValidationErrors } from '@angular/forms'   

export function positiveNumber(control: AbstractControl): ValidationErrors | null{

    const v=+control.value;

    if (v <= 0) {        
        return { positiveNumber: true, requiredValue: 0 };     
    }

    return null;   
}