import React from 'react';
import { format } from 'date-fns';
import { Badge } from './badge';
import { Button } from './button';
import { Bet } from '@shared/schema';

interface BetRowProps {
  bet: Bet;
  profit: number;
  onView: (bet: Bet) => void;
  onEdit: (bet: Bet) => void;
  onDelete: (bet: Bet) => void;
  getStatusColor: (status: string | null) => string;
  getProfitColor: (amount: number) => string;
  formatCurrency: (amount: number) => string;
}

export const BetRow: React.FC<BetRowProps> = ({ bet, profit, onView, onEdit, onDelete, getStatusColor, getProfitColor, formatCurrency }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {format(new Date(bet.date.includes('T') ? bet.date : bet.date + 'T12:00:00'), "MMM dd, yyyy")}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Badge className={getStatusColor(bet.status)}>
        {bet.status || 'pending'}
      </Badge>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
      {bet.type || '—'}
      {bet.source && <div className="text-xs text-gray-400">{bet.source}</div>}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      ${bet.stake}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      {bet.status === 'pending' ? (
        <span className="text-gray-600">—</span>
      ) : (
        <span className={getProfitColor(profit)}>
          {formatCurrency(profit)}
        </span>
      )}
    </td>
    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
      {bet.playerProps && Array.isArray(bet.playerProps) && bet.playerProps.length > 0 ? (
        <div>
          {(bet.playerProps as any[]).slice(0, 1).map((prop: any, index: number) => (
            <div key={index}>
              <span className="font-medium">{prop.player}</span>
              {prop.prop && <span> - {prop.prop}</span>}
            </div>
          ))}
          {bet.playerProps.length > 1 && (
            <div className="text-xs text-gray-400 mt-1">
              +{(bet.playerProps as any[]).length - 1} more props
            </div>
          )}
        </div>
      ) : (
        <span>—</span>
      )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
      <div className="flex justify-end gap-1">
        <Button size="sm" variant="ghost" onClick={() => onView(bet)} aria-label="View bet details">
          View
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(bet)} aria-label="Edit bet">
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(bet)} aria-label="Delete bet">
          Delete
        </Button>
      </div>
    </td>
  </tr>
);