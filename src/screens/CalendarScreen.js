/**
 * Cuidado-Now AI - Tela de Calendário
 * Calendário interativo para acompanhamento de humor, eventos e lembretes
 * Implementação otimizada com performance em mente
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Dimensions,
    Platform,
    Alert,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SW } = Dimensions.get('window');
const STORAGE_KEY = '@calendar_events';

// Dias da semana em português
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Tipos de eventos com cores
const EVENT_TYPES = {
    consulta: { label: 'Consulta', color: '#4285f4', icon: 'medical' },
    medicamento: { label: 'Medicamento', color: '#34a853', icon: 'medical-outline' },
    exercicio: { label: 'Exercício', color: '#fbbc04', icon: 'fitness' },
    meditacao: { label: 'Meditação', color: '#9c27b0', icon: 'flower' },
    terapia: { label: 'Terapia', color: '#00bcd4', icon: 'heart' },
    outro: { label: 'Outro', color: '#607d8b', icon: 'calendar' },
};

// Helper de alerta cross-platform
const showAlert = (title, message, buttons) => {
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 1) {
            if (window.confirm(`${title}\n${message}`)) {
                const confirmBtn = buttons.find(b => b.style === 'destructive' || b.text !== 'Cancelar');
                confirmBtn?.onPress?.();
            }
        } else {
            window.alert(`${title}\n${message}`);
        }
    } else {
        Alert.alert(title, message, buttons);
    }
};

// Componente de dia do calendário (Refinado)
const CalendarDay = memo(({ day, isToday, isSelected, isCurrentMonth, hasEvents, events, onPress, themeColors }) => {
    if (!day) return <View style={styles.dayEmpty} />;

    const eventDots = events?.slice(0, 3) || [];
    const textColor = isSelected
        ? '#fff'
        : (isToday ? themeColors.primary.main : (isCurrentMonth ? themeColors.text.primary : themeColors.text.muted));

    return (
        <TouchableOpacity
            style={[
                styles.dayCell,
                isToday && !isSelected && { backgroundColor: themeColors.primary.main + '15', borderWidth: 1, borderColor: themeColors.primary.main + '30' },
                isSelected && { backgroundColor: themeColors.primary.main, transform: [{ scale: 1.05 }], shadowColor: themeColors.primary.main, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
                !isCurrentMonth && !isSelected && { opacity: 0.5 }
            ]}
            onPress={() => onPress({ day, isCurrentMonth })}
            activeOpacity={0.6}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
            <Text style={[
                styles.dayText,
                { color: textColor },
                (isToday || isSelected) && { fontWeight: '700' },
                !isCurrentMonth && !isSelected && { fontWeight: '400' }
            ]}>
                {day}
            </Text>
            {hasEvents && (
                <View style={styles.dotsContainer}>
                    {eventDots.map((event, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.eventDot,
                                { backgroundColor: isSelected ? '#fff' : (EVENT_TYPES[event.type]?.color || '#888') }
                            ]}
                        />
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
});

// Componente de evento na lista
const EventItem = memo(({ event, onEdit, onDelete, themeColors }) => {
    const typeInfo = EVENT_TYPES[event.type] || EVENT_TYPES.outro;

    return (
        <View style={[styles.eventItem, { backgroundColor: themeColors.surface, borderLeftColor: typeInfo.color }]}>
            <View style={[styles.eventIcon, { backgroundColor: typeInfo.color + '20' }]}>
                <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
            </View>
            <View style={styles.eventContent}>
                <Text style={[styles.eventTitle, { color: themeColors.text.primary }]}>{event.title}</Text>
                {event.time && (
                    <Text style={[styles.eventTime, { color: themeColors.text.secondary }]}>
                        <Ionicons name="time-outline" size={12} /> {event.time}
                    </Text>
                )}
                {event.notes && (
                    <Text style={[styles.eventNotes, { color: themeColors.text.muted }]} numberOfLines={2}>
                        {event.notes}
                    </Text>
                )}
            </View>
            <View style={styles.eventActions}>
                <TouchableOpacity onPress={() => onEdit(event)} style={styles.eventBtn}>
                    <Ionicons name="pencil" size={18} color={themeColors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(event)} style={styles.eventBtn}>
                    <Ionicons name="trash-outline" size={18} color="#ea4335" />
                </TouchableOpacity>
            </View>
        </View>
    );
});

export default function CalendarScreen() {
    const { themeColors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    // Estados
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState({});
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Form states
    const [eventTitle, setEventTitle] = useState('');
    const [eventType, setEventType] = useState('outro');
    const [eventTime, setEventTime] = useState('');
    const [eventNotes, setEventNotes] = useState('');

    // Carregar eventos do storage
    const loadEvents = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setEvents(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
        }
    }, []);

    // Salvar eventos no storage
    const saveEvents = useCallback(async (newEvents) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents));
        } catch (error) {
            console.error('Erro ao salvar eventos:', error);
        }
    }, []);

    // Carregar ao focar na tela
    useFocusEffect(
        useCallback(() => {
            loadEvents();
        }, [loadEvents])
    );

    // Dados do calendário
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);

        const daysInMonth = lastDay.getDate();
        const daysInPrevMonth = prevLastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 = Domingo

        const days = [];

        // Dias do mês anterior
        for (let i = 0; i < startingDay; i++) {
            days.push({
                day: daysInPrevMonth - startingDay + i + 1,
                isCurrentMonth: false,
                fullDate: new Date(year, month - 1, daysInPrevMonth - startingDay + i + 1)
            });
        }

        // Dias do mês atual
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                fullDate: new Date(year, month, i)
            });
        }

        // Dias do próximo mês (completar 42 células para 6 linhas fixas)
        const totalDays = days.length;
        const cellsToFill = 42 - totalDays;

        for (let i = 1; i <= cellsToFill; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                fullDate: new Date(year, month + 1, i)
            });
        }

        return { year, month, days };
    }, [currentDate]);

    // Data formatada para chave
    const getDateKey = useCallback((arg) => {
        if (!arg) return null;
        let d;
        if (typeof arg === 'number') {
            // Assume mês atual se for número
            const { year, month } = calendarData;
            d = new Date(year, month, arg);
        } else if (arg.fullDate) {
            d = arg.fullDate;
        } else {
            return null;
        }
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, [calendarData]);

    // Verificar se é hoje
    const isToday = useCallback((dayObj) => {
        const today = new Date();
        // Se for número (selectedDate), convertemos. Se for obj, usamos fullDate
        let d;
        if (typeof dayObj === 'number') {
            const { year, month } = calendarData;
            d = new Date(year, month, dayObj);
        } else {
            d = dayObj.fullDate;
        }

        return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        );
    }, [calendarData]);

    // Navegação de meses com animação
    const switchMonth = useCallback((offset) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
        setSelectedDate(null);
    }, []);

    const goToPreviousMonth = () => switchMonth(-1);
    const goToNextMonth = () => switchMonth(1);



    const goToToday = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today.getDate());
    }, []);

    // Selecionar dia
    const handleDayPress = useCallback((dayInfo) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        // Se for do mês atual, seleciona. Se não, navega.
        if (typeof dayInfo === 'number') {
            setSelectedDate(dayInfo);
        } else if (dayInfo.isCurrentMonth) {
            setSelectedDate(dayInfo.day);
        }
    }, []);

    // Eventos do dia selecionado
    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        const key = getDateKey(selectedDate);
        return events[key] || [];
    }, [selectedDate, events, getDateKey]);

    // Abrir modal para adicionar evento
    const handleAddEvent = useCallback(() => {
        if (!selectedDate) {
            showAlert('Selecione uma data', 'Por favor, selecione um dia no calendário primeiro.');
            return;
        }
        setEditingEvent(null);
        setEventTitle('');
        setEventType('outro');
        setEventTime('');
        setEventNotes('');
        setShowEventModal(true);
    }, [selectedDate]);

    // Editar evento
    const handleEditEvent = useCallback((event) => {
        setEditingEvent(event);
        setEventTitle(event.title);
        setEventType(event.type);
        setEventTime(event.time || '');
        setEventNotes(event.notes || '');
        setShowEventModal(true);
    }, []);

    // Deletar evento
    const handleDeleteEvent = useCallback((event) => {
        showAlert(
            'Excluir evento',
            `Deseja excluir "${event.title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => {
                        const key = getDateKey(selectedDate);
                        const newEvents = { ...events };
                        newEvents[key] = (newEvents[key] || []).filter(e => e.id !== event.id);
                        if (newEvents[key].length === 0) {
                            delete newEvents[key];
                        }
                        setEvents(newEvents);
                        saveEvents(newEvents);
                    }
                }
            ]
        );
    }, [events, selectedDate, getDateKey, saveEvents]);

    // Salvar evento
    const handleSaveEvent = useCallback(() => {
        if (!eventTitle.trim()) {
            showAlert('Título obrigatório', 'Por favor, insira um título para o evento.');
            return;
        }

        const key = getDateKey(selectedDate);
        const newEvent = {
            id: editingEvent?.id || Date.now().toString(),
            title: eventTitle.trim(),
            type: eventType,
            time: eventTime.trim(),
            notes: eventNotes.trim(),
        };

        const newEvents = { ...events };
        if (!newEvents[key]) {
            newEvents[key] = [];
        }

        if (editingEvent) {
            // Atualizar evento existente
            const idx = newEvents[key].findIndex(e => e.id === editingEvent.id);
            if (idx >= 0) {
                newEvents[key][idx] = newEvent;
            }
        } else {
            // Adicionar novo evento
            newEvents[key].push(newEvent);
        }

        setEvents(newEvents);
        saveEvents(newEvents);
        setShowEventModal(false);
    }, [eventTitle, eventType, eventTime, eventNotes, selectedDate, editingEvent, events, getDateKey, saveEvents]);

    // Fechar modal
    const handleCloseModal = useCallback(() => {
        setShowEventModal(false);
        setEditingEvent(null);
    }, []);

    // Renderizar cabeçalho dos dias da semana
    const renderWeekdayHeaders = useMemo(() => (
        <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((day, idx) => (
                <View key={idx} style={styles.weekdayCell}>
                    <Text style={[styles.weekdayText, { color: themeColors.text.secondary }]}>{day}</Text>
                </View>
            ))}
        </View>
    ), [themeColors]);

    // Renderizar dias do calendário
    const renderCalendarDays = useMemo(() => {
        const rows = [];
        let cells = [];

        calendarData.days.forEach((dayItem, idx) => {
            const key = getDateKey(dayItem);
            const dayEvents = events[key] || [];

            cells.push(
                <CalendarDay
                    key={idx}
                    day={dayItem.day}
                    isToday={isToday(dayItem)}
                    isSelected={selectedDate === dayItem.day && dayItem.isCurrentMonth}
                    isCurrentMonth={dayItem.isCurrentMonth}
                    hasEvents={dayEvents.length > 0}
                    events={dayEvents}
                    onPress={handleDayPress}
                    themeColors={themeColors}
                />
            );

            if ((idx + 1) % 7 === 0) {
                rows.push(<View key={`row-${idx}`} style={styles.weekRow}>{cells}</View>);
                cells = [];
            }
        });

        // Última linha incompleta
        if (cells.length > 0) {
            while (cells.length < 7) {
                cells.push(<View key={`empty-${cells.length}`} style={styles.dayEmpty} />);
            }
            rows.push(<View key="last-row" style={styles.weekRow}>{cells}</View>);
        }

        return rows;
    }, [calendarData, events, selectedDate, isToday, handleDayPress, getDateKey, themeColors]);

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: themeColors.surface }]}>
                <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>Calendário</Text>
                <TouchableOpacity onPress={goToToday} style={styles.todayBtn}>
                    <Text style={[styles.todayBtnText, { color: themeColors.primary.main }]}>Hoje</Text>
                </TouchableOpacity>
            </View>

            {/* Navegação do mês */}
            <View style={[styles.monthNav, { backgroundColor: themeColors.surface }]}>
                <TouchableOpacity onPress={goToPreviousMonth} style={styles.navBtn}>
                    <Ionicons name="chevron-back" size={24} color={themeColors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.monthTitle, { color: themeColors.text.primary }]}>
                    {MONTHS[calendarData.month]} {calendarData.year}
                </Text>
                <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn}>
                    <Ionicons name="chevron-forward" size={24} color={themeColors.text.primary} />
                </TouchableOpacity>
            </View>

            {/* Calendário */}
            <View style={[styles.calendar, { backgroundColor: themeColors.surface }]}>
                {renderWeekdayHeaders}
                {renderCalendarDays}
            </View>

            {/* Eventos do dia */}
            <View style={styles.eventsSection}>
                <View style={styles.eventsSectionHeader}>
                    <Text style={[styles.eventsSectionTitle, { color: themeColors.text.primary }]}>
                        {selectedDate
                            ? `${selectedDate} de ${MONTHS[calendarData.month]}`
                            : 'Selecione um dia'
                        }
                    </Text>
                    <TouchableOpacity
                        onPress={handleAddEvent}
                        style={[styles.addEventBtn, { backgroundColor: themeColors.primary.main }]}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addEventText}>Adicionar</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
                    {selectedDateEvents.length === 0 ? (
                        <View style={styles.noEvents}>
                            <Ionicons name="calendar-outline" size={48} color={themeColors.text.muted} />
                            <Text style={[styles.noEventsText, { color: themeColors.text.muted }]}>
                                {selectedDate ? 'Nenhum evento neste dia' : 'Selecione um dia para ver os eventos'}
                            </Text>
                        </View>
                    ) : (
                        selectedDateEvents.map(event => (
                            <EventItem
                                key={event.id}
                                event={event}
                                onEdit={handleEditEvent}
                                onDelete={handleDeleteEvent}
                                themeColors={themeColors}
                            />
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Modal de Adicionar/Editar Evento */}
            <Modal visible={showEventModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>
                                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                            </Text>
                            <TouchableOpacity onPress={handleCloseModal}>
                                <Ionicons name="close" size={24} color={themeColors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            {/* Título */}
                            <Text style={[styles.inputLabel, { color: themeColors.text.secondary }]}>Título *</Text>
                            <TextInput
                                style={[styles.textInput, {
                                    backgroundColor: isDark ? '#333' : '#f5f5f5',
                                    color: themeColors.text.primary
                                }]}
                                value={eventTitle}
                                onChangeText={setEventTitle}
                                placeholder="Ex: Consulta com psicólogo"
                                placeholderTextColor={themeColors.text.muted}
                            />

                            {/* Tipo */}
                            <Text style={[styles.inputLabel, { color: themeColors.text.secondary }]}>Tipo</Text>
                            <View style={styles.typeGrid}>
                                {Object.entries(EVENT_TYPES).map(([key, info]) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.typeBtn,
                                            { borderColor: info.color },
                                            eventType === key && { backgroundColor: info.color }
                                        ]}
                                        onPress={() => setEventType(key)}
                                    >
                                        <Ionicons
                                            name={info.icon}
                                            size={16}
                                            color={eventType === key ? '#fff' : info.color}
                                        />
                                        <Text style={[
                                            styles.typeBtnText,
                                            { color: eventType === key ? '#fff' : info.color }
                                        ]}>
                                            {info.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Horário */}
                            <Text style={[styles.inputLabel, { color: themeColors.text.secondary }]}>Horário</Text>
                            <TextInput
                                style={[styles.textInput, {
                                    backgroundColor: isDark ? '#333' : '#f5f5f5',
                                    color: themeColors.text.primary
                                }]}
                                value={eventTime}
                                onChangeText={setEventTime}
                                placeholder="Ex: 14:00"
                                placeholderTextColor={themeColors.text.muted}
                            />

                            {/* Notas */}
                            <Text style={[styles.inputLabel, { color: themeColors.text.secondary }]}>Notas</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea, {
                                    backgroundColor: isDark ? '#333' : '#f5f5f5',
                                    color: themeColors.text.primary
                                }]}
                                value={eventNotes}
                                onChangeText={setEventNotes}
                                placeholder="Observações adicionais..."
                                placeholderTextColor={themeColors.text.muted}
                                multiline
                                numberOfLines={3}
                            />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { borderColor: themeColors.text.muted }]}
                                onPress={handleCloseModal}
                            >
                                <Text style={[styles.cancelBtnText, { color: themeColors.text.secondary }]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: themeColors.primary.main }]}
                                onPress={handleSaveEvent}
                            >
                                <Text style={styles.saveBtnText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    todayBtn: { padding: 8 },
    todayBtnText: { fontSize: 14, fontWeight: '600' },

    // Month navigation
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    navBtn: { padding: 8 },
    monthTitle: { fontSize: 18, fontWeight: '600' },

    // Calendar
    calendar: {
        paddingHorizontal: 12,
        paddingBottom: 8,
        paddingTop: 4,
    },
    weekdaysRow: {
        flexDirection: 'row',
        marginBottom: 8,
        justifyContent: 'space-around',
    },
    weekdayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 6
    },
    weekdayText: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontSize: 11
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 4,
    },
    dayCell: {
        width: (SW - 40) / 7 - 4, // Calculate width dynamically with gaps
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14, // Softer rounding
        marginHorizontal: 2,
    },
    dayEmpty: {
        width: (SW - 40) / 7 - 4,
        height: 42,
        marginHorizontal: 2
    },
    dayText: { fontSize: 15 },
    dotsContainer: {
        flexDirection: 'row',
        gap: 3,
        position: 'absolute',
        bottom: 5
    },
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2
    },

    // Events section
    eventsSection: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    eventsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    eventsSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    addEventBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        gap: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    addEventText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    eventsList: { flex: 1 },
    noEvents: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, opacity: 0.6 },
    noEventsText: { marginTop: 16, fontSize: 16, textAlign: 'center' },

    // Event item
    eventItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderLeftWidth: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    eventIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    eventContent: { flex: 1 },
    eventTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    eventTime: { fontSize: 13, marginBottom: 4, fontWeight: '500' },
    eventNotes: { fontSize: 13, lineHeight: 18, opacity: 0.8 },
    eventActions: { flexDirection: 'row', gap: 8 },
    eventBtn: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
    },

    // Modal Style Updates
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        padding: 20,
        borderBottomWidth: 0,
    },
    modalTitle: { fontSize: 22, fontWeight: '700' },
    inputLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10, marginTop: 16 },
    textInput: {
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    typeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1.5,
        gap: 8,
    },
    modalActions: {
        paddingVertical: 20,
        borderTopWidth: 0,
    },
    saveBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 2,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
    },
});
