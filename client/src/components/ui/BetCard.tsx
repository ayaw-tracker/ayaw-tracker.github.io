import React from 'react';
import { format } from 'date-fns';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Bet } from '@shared/schema';

interface BetCardProps {
  bet: Bet;
  profit: number;
  onView: (bet: Bet) => void;
  onEdit: (bet: Bet) => void;
  onDelete: (bet: Bet) => void;
  getStatusColor: (status: string | null) => string;
  getProfitColor: (amount: number) => string;
  formatCurrency: (amount: number) => string;
}

export const BetCard: React.FC<BetCardProps> = ({ bet, profit, onView, onEdit, onDelete, getStatusColor, getProfitColor, formatCurrency }) => (
  <Card className="mb-4 shadow-md">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-400">{format(new Date(bet.date.includes('T') ? bet.date : bet.date + 'T12:00:00'), "MMM dd, yyyy")}</div>
        <Badge className={getStatusColor(bet.status)}>
          {bet.status || 'pending'}
        </Badge>
      </div>
      <div className="font-semibold text-lg text-gray-900 mb-1">
        {bet.type || '—'}
        {bet.source && <span className="ml-2 text-xs text-gray-400">{bet.source}</span>}
      </div>
      <div className="flex justify-between text-sm mb-1">
        <span>Wagered:</span>
        <span>${bet.stake}</span>
      </div>
      <div className="flex justify-between text-sm mb-1">
        <span>Profit/Loss:</span>
        {bet.status === 'pending' ? (
          <span className="text-gray-600">—</span>
        ) : (
          <span className={getProfitColor(profit)}>{formatCurrency(profit)}</span>
        )}
      </div>
      <div className="text-sm text-gray-600 mb-2">
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
      </div>
      <div className="flex justify-end gap-2">
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
    </CardContent>
  </Card>
);