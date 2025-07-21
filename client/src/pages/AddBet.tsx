import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Icon } from "@/components/ui/icon";
import { BetType, BetStatus } from '@shared/types';
import { insertBetSchema } from '@shared/schema';

type FormData = z.infer<typeof insertBetSchema>;

interface PlayerProp {
  id: string;
  player: string;
  prop: string;
  result: string;
  sport: string;
  league: string;
  sportsbook: string;
  odds: string;
}

export default function AddBet() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [currentBetType, setCurrentBetType] = useState<'straight' | 'parlay'>('straight');
  const [advancedFieldsVisible, setAdvancedFieldsVisible] = useState(false);
  const [playerProps, setPlayerProps] = useState<PlayerProp[]>([{
    id: 'prop-1',
    player: '',
    prop: '',
    result: '',
    sport: '',
    league: '',
    sportsbook: '',
    odds: ''
  }]);
  const [playerPropCounter, setPlayerPropCounter] = useState(1);

  // Remove local formSchema and use insertBetSchema for validation
  const form = useForm<z.infer<typeof insertBetSchema>>({
    resolver: zodResolver(insertBetSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      betType: 'straight',
      result: undefined,
      payoutType: 'Power Play',
      amountWagered: '',
      amountWonLoss: '',
      straightBetOdds: '',
      playerProps: [],
    },
  });

  // Handle bet type selection
  const handleBetTypeSelection = (type: 'straight' | 'parlay') => {
    setCurrentBetType(type);
    form.setValue('betType', type);
    
    if (type === BetType.STRAIGHT) {
      // Reset to single prop for straight bets
      setPlayerProps([{
        id: 'prop-1',
        player: '',
        prop: '',
        result: '',
        sport: '',
        league: '',
        sportsbook: '',
        odds: ''
      }]);
    } else {
      // For parlays, ensure we have at least one prop
      if (playerProps.length === 0) {
        addPlayerPropRow();
      }
    }
  };

  // Add new player prop row for parlays
  const addPlayerPropRow = () => {
    const newCounter = playerPropCounter + 1;
    setPlayerPropCounter(newCounter);
    
    const newProp: PlayerProp = {
      id: `prop-${newCounter}`,
      player: '',
      prop: '',
      result: '',
      sport: '',
      league: '',
      sportsbook: '',
      odds: ''
    };
    
    setPlayerProps(prev => [...prev, newProp]);
  };

  // Remove player prop row
  const removePlayerPropRow = (id: string) => {
    setPlayerProps(prev => prev.filter(prop => prop.id !== id));
  };

  // Update player prop data
  const updatePlayerProp = (id: string, field: keyof PlayerProp, value: string) => {
    setPlayerProps(prev => prev.map(prop => 
      prop.id === id ? { ...prop, [field]: value } : prop
    ));
    
    // Auto-fill sportsbook for all empty fields in parlays
    if (field === 'sportsbook' && currentBetType === BetType.PARLAY && value) {
      setPlayerProps(prev => prev.map(prop => 
        prop.id !== id && (!prop.sportsbook || prop.sportsbook.length < value.length)
          ? { ...prop, sportsbook: value }
          : prop
      ));
    }
  };

  // Auto-calculation logic for straight bets
  const updateWonLossForStraightBet = () => {
    const amount = parseFloat(form.getValues('amountWagered')) || 0;
    const oddsValue = form.getValues('straightBetOdds')?.trim() || '';
    const result = form.getValues('result');
    
    if (amount > 0 && oddsValue && result === BetStatus.WIN) {
      let payout = 0;
      
      if (oddsValue.startsWith('+')) {
        // Positive odds: +150 means win $150 on $100 bet
        const odds = parseFloat(oddsValue);
        payout = amount * (odds / 100);
      } else if (oddsValue.startsWith('-')) {
        // Negative odds: -110 means bet $110 to win $100
        const odds = Math.abs(parseFloat(oddsValue));
        payout = amount * (100 / odds);
      }
      
      form.setValue('amountWonLoss', payout.toFixed(2));
    } else if (result === BetStatus.LOSS) {
      form.setValue('amountWonLoss', (-amount).toFixed(2));
    } else if (result === BetStatus.PUSH) {
      form.setValue('amountWonLoss', '0.00');
    }
  };

  // Auto-fill for parlay results
  const updateWonLossBasedOnResult = () => {
    const amount = parseFloat(form.getValues('amountWagered')) || 0;
    const result = form.getValues('result');
    
    if (result === BetStatus.LOSS) {
      form.setValue('amountWonLoss', (-amount).toFixed(2));
    } else if (result === BetStatus.PUSH) {
      form.setValue('amountWonLoss', '0.00');
    }
    // For 'Win', user manually enters the payout amount
  };

  // Watch for changes that trigger auto-calculations
  const watchedAmountWagered = form.watch('amountWagered');
  const watchedResult = form.watch('result');
  const watchedStraightBetOdds = form.watch('straightBetOdds');

  useEffect(() => {
    if (currentBetType === BetType.STRAIGHT) {
      updateWonLossForStraightBet();
    } else {
      updateWonLossBasedOnResult();
    }
  }, [watchedAmountWagered, watchedResult, watchedStraightBetOdds, currentBetType]);

  const createBetMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Filter out empty player props and format them properly
      const validPlayerProps = playerProps.filter(prop => 
        prop.player.trim() && prop.prop.trim()
      ).map(prop => ({
        id: prop.id,
        player: prop.player,
        prop: prop.prop,
        result: prop.result,
        sport: prop.sport,
        league: prop.league,
        sportsbook: prop.sportsbook,
        odds: prop.odds
      }));

      const betData = {
        date: data.date + 'T00:00:00.000Z',
        source: playerProps[0]?.sportsbook || 'Unknown',
        location: '', // Will be added later
        type: data.betType,
        stake: data.amountWagered,
        potentialReturn: data.amountWonLoss,
        actualReturn: data.result === BetStatus.WIN ? data.amountWonLoss : '0',
        odds: data.straightBetOdds || '',
        status: data.result === BetStatus.WIN ? BetStatus.WON : data.result === BetStatus.LOSS ? BetStatus.LOST : BetStatus.PUSH,
        playerProps: validPlayerProps.length > 0 ? validPlayerProps : null,
      };
      
      const response = await apiRequest("POST", "/api/bets", betData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bet added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
      
      // Reset form
      form.reset({
        date: format(new Date(), "yyyy-MM-dd"),
        betType: 'straight',
        result: undefined,
        amountWagered: '',
        amountWonLoss: '',
        straightBetOdds: '',
      });
      
      // Reset state
      setCurrentBetType(BetType.STRAIGHT);
      setPlayerProps([{
        id: 'prop-1',
        player: '',
        prop: '',
        result: '',
        sport: '',
        league: '',
        sportsbook: '',
        odds: ''
      }]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add bet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createBetMutation.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Bet</h2>
        <p className="text-gray-600">Record your sports bet details for tracking and analysis.</p>
      </div>

      {/* Content Card - Full Width */}
      <Card className="w-full">
          <CardHeader>
            <CardTitle>Bet Details</CardTitle>
          </CardHeader>
          <CardContent>
          {/* Bet Type Selection */}
          <div className="mb-6">
            <Label className="text-base font-semibold mb-3 block">Bet Type</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => handleBetTypeSelection(BetType.STRAIGHT)}
                className={`flex-1 ${
                  currentBetType === BetType.STRAIGHT
                    ? 'bg-[#3498DB] text-white hover:bg-[#2980B9]'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Straight Bet
              </Button>
              <Button
                type="button"
                onClick={() => handleBetTypeSelection(BetType.PARLAY)}
                className={`flex-1 ${
                  currentBetType === BetType.PARLAY
                    ? 'bg-[#3498DB] text-white hover:bg-[#2980B9]'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Parlay
              </Button>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Date - Centered within section */}
              <div className="flex justify-center mb-4">
                <div className="w-48">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-center">Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="text-center" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Bet Result and Odds (for straight bets) / Payout Type (for parlays) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bet Result</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Result" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={BetStatus.WIN}>{BetStatus.WIN}</SelectItem>
                          <SelectItem value={BetStatus.LOSS}>{BetStatus.LOSS}</SelectItem>
                          <SelectItem value={BetStatus.PUSH}>{BetStatus.PUSH}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {currentBetType === BetType.STRAIGHT ? (
                  <FormField
                    control={form.control}
                    name="straightBetOdds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Odds</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+150 or -110"
                            {...field}
                            onBlur={(e) => {
                              const value = e.target.value.trim();
                              if (value && !value.startsWith('+') && !value.startsWith('-') && parseFloat(value) > 0) {
                                const newValue = '+' + value;
                                field.onChange(newValue);
                                form.setValue('straightBetOdds', newValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="payoutType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payout Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'Power Play'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Payout Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Power Play">Power Play</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Super Boost">Super Boost</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Amount Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amountWagered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Wagered ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amountWonLoss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Won/Loss ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={currentBetType === BetType.STRAIGHT ? "Calculated" : "Enter win amount"}
                          {...field}
                          readOnly={currentBetType === BetType.STRAIGHT}
                          className={currentBetType === BetType.STRAIGHT ? "bg-gray-100 text-gray-600" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>



              {/* Player Props Section */}
              <div className="space-y-4">
                <div className="mb-4">
                  <Label className="text-base font-semibold block text-center">
                    {currentBetType === BetType.STRAIGHT ? 'Individual Player/Team Bets' : 'Individual Player/Team Bets'}
                  </Label>
                </div>

                {/* Player Prop Rows */}
                <div className="space-y-3">
                  {playerProps.map((prop, index) => (
                    <div key={prop.id} className="p-4 rounded-lg">
                      {/* Basic Fields - Hidden when advanced fields are visible */}
                      {!advancedFieldsVisible && (
                        <div className={`grid ${currentBetType === BetType.PARLAY ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-3 mb-3`}>
                          <div>
                            <Label htmlFor={`${prop.id}-player`} className="sr-only">Player/Team Name</Label>
                            <Input
                              id={`${prop.id}-player`}
                              placeholder={currentBetType === BetType.STRAIGHT ? "Team/Player Name (e.g., Lakers, Mahomes)" : "Player/Team Name (e.g., LeBron James)"}
                              value={prop.player}
                              onChange={(e) => updatePlayerProp(prop.id, 'player', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`${prop.id}-prop`} className="sr-only">Prop Type</Label>
                            <Input
                              id={`${prop.id}-prop`}
                              placeholder={currentBetType === BetType.STRAIGHT ? "Bet Type (e.g., Moneyline, Spread -3.5)" : "Prop Type (e.g., Over 25.5 Pts)"}
                              value={prop.prop}
                              onChange={(e) => updatePlayerProp(prop.id, 'prop', e.target.value)}
                              className="text-sm"
                            />
                          </div>

                          {/* Result dropdown only for parlay legs */}
                          {currentBetType === BetType.PARLAY && (
                            <div>
                              <Label htmlFor={`${prop.id}-result`} className="sr-only">Result</Label>
                              <Select
                                value={prop.result}
                                onValueChange={(value) => updatePlayerProp(prop.id, 'result', value)}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue placeholder="Win" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={BetStatus.WIN}>{BetStatus.WIN}</SelectItem>
                                  <SelectItem value={BetStatus.LOSS}>{BetStatus.LOSS}</SelectItem>
                                  <SelectItem value={BetStatus.PUSH}>{BetStatus.PUSH}</SelectItem>
                                  <SelectItem value="DNP/Void">DNP/Void</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Advanced Fields - Only visible when toggled */}
                      {advancedFieldsVisible && (
                        <div className={`grid ${currentBetType === BetType.PARLAY ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-4'} gap-3`}>
                          <div>
                            <Label htmlFor={`${prop.id}-sport`} className="sr-only">Sport</Label>
                            <Input
                              id={`${prop.id}-sport`}
                              placeholder="Sport (e.g., NBA)"
                              value={prop.sport}
                              onChange={(e) => updatePlayerProp(prop.id, 'sport', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`${prop.id}-league`} className="sr-only">League</Label>
                            <Input
                              id={`${prop.id}-league`}
                              placeholder="League (e.g., EuroLeague)"
                              value={prop.league}
                              onChange={(e) => updatePlayerProp(prop.id, 'league', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          

                          
                          <div>
                            <Label htmlFor={`${prop.id}-sportsbook`} className="sr-only">Sportsbook</Label>
                            <Input
                              id={`${prop.id}-sportsbook`}
                              placeholder="Sportsbook (e.g., DraftKings)"
                              value={prop.sportsbook}
                              onChange={(e) => updatePlayerProp(prop.id, 'sportsbook', e.target.value)}
                              className="text-sm"
                            />
                          </div>

                          {/* Individual odds only for parlay legs */}
                          {currentBetType === BetType.PARLAY && (
                            <div>
                              <Label htmlFor={`${prop.id}-odds`} className="sr-only">Odds</Label>
                              <Input
                                id={`${prop.id}-odds`}
                                placeholder="Odds (e.g., +150, -110)"
                                value={prop.odds}
                                onChange={(e) => updatePlayerProp(prop.id, 'odds', e.target.value)}
                                onBlur={(e) => {
                                  const value = e.target.value.trim();
                                  if (value && !value.startsWith('+') && !value.startsWith('-') && parseFloat(value) > 0) {
                                    updatePlayerProp(prop.id, 'odds', '+' + value);
                                  }
                                }}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Remove button for parlay legs */}
                      {currentBetType === BetType.PARLAY && playerProps.length > 1 && (
                        <div className="flex justify-end mt-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePlayerPropRow(prop.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="close" size={16} className="mr-1" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Parlay Leg Button */}
                {currentBetType === BetType.PARLAY && (
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addPlayerPropRow}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-4 py-2"
                    >
                      + Add Player/Team Bet
                    </Button>
                  </div>
                )}

                {/* Bottom Row: More Details (left), Space (middle), Submit Button (right) */}
                <div className="flex justify-between items-center">
                  {/* More Details Toggle */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdvancedFieldsVisible(!advancedFieldsVisible)}
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    <Icon name={advancedFieldsVisible ? "minus" : "plus"} size={16} className="mr-1" />
                    {advancedFieldsVisible ? "Hide Details" : "More Details"}
                  </Button>

                  {/* Space for future button */}
                  <div className="flex-1"></div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="bg-[#3498DB] hover:bg-[#2980B9]"
                    disabled={createBetMutation.isPending}
                  >
                    {createBetMutation.isPending ? (
                      <>
                        <Icon name="spinner" size={16} className="mr-2 animate-spin" />
                        Adding {currentBetType === BetType.PARLAY ? 'Parlay' : 'Straight Bet'} Entry...
                      </>
                    ) : (
                      <>
                        Add {currentBetType === BetType.PARLAY ? 'Parlay' : 'Straight Bet'} Entry
                      </>
                    )}
                  </Button>
                </div>
              </div>




            </form>
          </Form>
          </CardContent>
        </Card>
    </div>
  );
}