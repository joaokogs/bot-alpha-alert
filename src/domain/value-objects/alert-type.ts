export const AlertType = {
  ALPHA: 'ALPHA',
  PHENO: 'PHENO',
  SWARM: 'SWARM',
} as const;

export type AlertType = (typeof AlertType)[keyof typeof AlertType];
