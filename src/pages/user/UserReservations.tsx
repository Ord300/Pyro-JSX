import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { useActivities } from '../../hooks/queries/activities';
import { usePlaces } from '../../hooks/queries/places';
import { mockReservations, mockTimeSlots } from '../../data/reservationData';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, CheckCircle2, X } from 'lucide-react';

export function UserReservations() {
  const { data: activities = [] } = useActivities();
  const { data: places = [] } = usePlaces();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isPastDate = (day: number) => {
    const date = new Date(year, month, day);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    if (isPastDate(day)) return;
    setSelectedDate(formatDate(day));
    setSelectedTime(null);
    setSelectedPlace(null);
    setBookingConfirmed(false);
  };

  const handleActivitySelect = (activityId: number) => {
    setSelectedActivity(activityId);
    setSelectedTime(null);
    setSelectedPlace(null);
  };

  const handleConfirmBooking = () => {
    setBookingConfirmed(true);
  };

  const resetBooking = () => {
    setShowBookingFlow(false);
    setSelectedActivity(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedPlace(null);
    setBookingConfirmed(false);
  };

  const selectedActivityData = activities.find((a) => a.id === selectedActivity);
  const selectedPlaceData = places.find((p) => p.id === selectedPlace);

  const renderCalendar = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Calendrier</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {dayNames.map((day) => (
          <div key={day} className="py-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(day);
          const isSelected = selectedDate === dateStr;
          const isPast = isPastDate(day);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day}
              onClick={() => handleDateSelect(day)}
              disabled={isPast}
              className={cn(
                'flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                isPast && 'cursor-not-allowed text-slate-300 dark:text-slate-600',
                !isPast && !isSelected && 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                isSelected && 'bg-primary-600 text-white',
                isTodayDate && !isSelected && 'ring-2 ring-primary-500'
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </Card>
  );

  const renderBookingFlow = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Nouvelle réservation</h2>
        <Button variant="outline" size="sm" onClick={resetBooking}>
          <X className="mr-2 h-4 w-4" />
          Annuler
        </Button>
      </div>

      {/* Step 1: Activity */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">1. Choisissez l'activité</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => handleActivitySelect(activity.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all',
                selectedActivity === activity.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              )}
            >
              <span className="text-3xl">{activity.icon}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{activity.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{activity.duration}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Date */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">2. Choisissez la date</h3>
        {renderCalendar()}
      </div>

      {/* Step 3: Time */}
      {selectedDate && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">3. Choisissez l'heure</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {mockTimeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={cn(
                  'rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all',
                  !slot.available && 'cursor-not-allowed border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-600',
                  slot.available && selectedTime === slot.time && 'border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
                  slot.available && selectedTime !== slot.time && 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Place */}
      {selectedTime && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">4. Choisissez le lieu</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {places
              .filter((place) => place.status === 'Disponible')
              .map((place) => (
                <button
                  key={place.id}
                  onClick={() => setSelectedPlace(place.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all',
                    selectedPlace === place.id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  )}
                >
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{place.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{place.type} • {place.location}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Confirmation */}
      {selectedPlace && !bookingConfirmed && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Récapitulatif</h4>
          <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <p>Activité : <strong>{selectedActivityData?.name}</strong></p>
            <p>Date : <strong>{selectedDate}</strong></p>
            <p>Heure : <strong>{selectedTime}</strong></p>
            <p>Lieu : <strong>{selectedPlaceData?.name}</strong></p>
          </div>
          <Button className="mt-4 w-full" onClick={handleConfirmBooking}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirmer la réservation
          </Button>
        </div>
      )}

      {bookingConfirmed && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
          <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-200">Réservation confirmée !</h3>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            {selectedActivityData?.name} - {selectedDate} à {selectedTime}
            <br />
            {selectedPlaceData?.name}
          </p>
          <Button className="mt-4" onClick={resetBooking}>
            Nouvelle réservation
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Réservations</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Réservez vos séances et consultez vos réservations.
          </p>
        </div>
        <Button onClick={() => setShowBookingFlow(true)}>
          <Calendar className="mr-2 h-4 w-4" />
          Nouvelle réservation
        </Button>
      </div>

      {showBookingFlow ? (
        renderBookingFlow()
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {renderCalendar()}
            </div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Mes réservations</h2>
              <div className="mt-4 space-y-3">
                {mockReservations.map((reservation) => (
                  <div key={reservation.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{reservation.activityIcon}</span>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{reservation.activityName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {reservation.date} à {reservation.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        reservation.status === 'Confirmée' ? 'success' :
                        reservation.status === 'En attente' ? 'warning' :
                        reservation.status === 'Annulée' ? 'danger' : 'default'
                      }>
                        {reservation.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3" />
                      {reservation.placeName}
                      <Clock className="ml-2 h-3 w-3" />
                      {reservation.duration}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
