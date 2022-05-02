//
// Define what the user inputs
//

type TextInputViewConcept = {
  type: 'text';
  priority: number;
  maxLength: number;
  minLength: number;
};

type PasswordInputViewConcept = {
  type: 'password';
  priority: number;
  maxLength: number;
  minLength: number;
};

export type InputViewConcept = TextInputViewConcept | PasswordInputViewConcept;
export type InputViewConceptWithKey = InputViewConcept & { key: string };

//
// Define what to display to user
//

type TextOutputViewConcept = {
  type: 'text';
  priority: number;
};

type QRImageOutputViewConcept = {
  type: 'qr';
  priority: number;
};

export type OutputViewConcept =
  | TextOutputViewConcept
  | QRImageOutputViewConcept;
export type OutputViewConceptWithKey = OutputViewConcept & { key: string };

//
// functions
//

export function sortedViewConceptsInternal<
  VC extends { type: string; priority: number }
>(concepts: { [key: string]: VC }): (VC & { key: string })[] {
  return Object.entries(concepts)
    .sort((l, r) => l[1].priority - r[1].priority)
    .map((c) => ({ ...c[1], key: c[0] }));
}
