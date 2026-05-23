export const comparisonPlans = [
  {
    id: 'starter',
    label: 'Starter',
    price: '$29/mo',
    rollout: 'Same-day setup',
    fit: 'Small teams validating a workflow.',
    note: 'Limited automation, straightforward approval path.',
  },
  {
    id: 'team',
    label: 'Team',
    price: '$79/mo',
    rollout: '3-day rollout',
    fit: 'Teams that need shared review and reporting.',
    note: 'Best default when you need stronger controls without enterprise overhead.',
  },
  {
    id: 'business',
    label: 'Business',
    price: '$149/mo',
    rollout: '1-week rollout',
    fit: 'Multi-workspace teams with deeper review flows.',
    note: 'More configuration surface — worth comparing before you commit.',
  },
] as const

export type ComparisonPlanId = (typeof comparisonPlans)[number]['id']
