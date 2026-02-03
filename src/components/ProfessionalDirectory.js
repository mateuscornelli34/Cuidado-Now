import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, FlatList, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, shadows, typography } from '../styles/theme';
import { professionalsData } from '../data/ProfessionalsData';

const FILTERS = ['Todos', 'Psicólogos', 'Psiquiatras', 'Online'];

export default function ProfessionalDirectory({ themeColors }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedProfession, setSelectedProfession] = useState('todos');
    const [searchText, setSearchText] = useState('');

    const styles = useMemo(() => getStyles(themeColors), [themeColors]);

    const handleFilterSelect = (filter) => {
        if (filter === 'Todos') setSelectedProfession('todos');
        else if (filter === 'Psicólogos') setSelectedProfession('psicoterapeuta');
        else if (filter === 'Psiquiatras') setSelectedProfession('psiquiatra');
        else if (filter === 'Online') setSelectedProfession('online');
    };

    const isActiveFilter = (filter) => {
        if (filter === 'Todos') return selectedProfession === 'todos' || !selectedProfession;
        if (filter === 'Psicólogos') return selectedProfession === 'psicoterapeuta';
        if (filter === 'Psiquiatras') return selectedProfession === 'psiquiatra';
        if (filter === 'Online') return selectedProfession === 'online';
        return false;
    };

    const filteredProfessionals = useMemo(() => {
        return professionalsData.filter(p => {
            if (selectedProfession === 'online') {
                if (!p.isOnline) return false;
            }
            else if (selectedProfession && selectedProfession !== 'todos' && selectedProfession !== 'online' && !p.specialty.includes(selectedProfession)) return false;

            if (searchText) {
                const lowerText = searchText.toLowerCase();
                return p.name.toLowerCase().includes(lowerText) ||
                    p.tags.some(t => t.toLowerCase().includes(lowerText));
            }
            return true;
        });
    }, [selectedProfession, searchText]);

    const renderProfessionalCard = useCallback(({ item }) => (
        <TouchableOpacity style={styles.psymeetCard} activeOpacity={0.9} onPress={() => Alert.alert('Perfil', `Visualizar perfil de ${item.name}`)}>
            <View style={styles.psymeetCardHeader}>
                <Image
                    source={{ uri: item.photo }}
                    style={styles.psymeetAvatar}
                    resizeMode="cover"
                />
                <View style={styles.psymeetInfo}>
                    <View style={styles.psymeetNameRow}>
                        <Text style={styles.psymeetName}>{item.name}</Text>
                        {item.isVerified && (
                            <Ionicons name="checkmark-circle" size={16} color={themeColors.primary.main} style={{ marginLeft: 4 }} />
                        )}
                    </View>
                    <Text style={styles.psymeetTitle}>{item.title}</Text>

                    <View style={styles.psymeetRatingRow}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.psymeetRatingText}>{item.rating} ({item.reviews} avaliações)</Text>
                    </View>
                </View>
                <View style={styles.psymeetPriceBadge}>
                    <Text style={styles.psymeetPriceLabel}>Sessão</Text>
                    <Text style={styles.psymeetPriceValue}>R$ {item.price}</Text>
                </View>
            </View>

            <View style={styles.psymeetBody}>
                <Text style={styles.psymeetBio} numberOfLines={3}>{item.bio}</Text>

                <View style={styles.psymeetTags}>
                    {item.tags.slice(0, 3).map(tag => (
                        <View key={tag} style={styles.psymeetTag}>
                            <Text style={styles.psymeetTagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.psymeetFooter}>
                <TouchableOpacity style={styles.psymeetOutlineBtn} onPress={() => Alert.alert('Chat', 'Iniciar conversa')}>
                    <Text style={styles.psymeetOutlineBtnText}>Conversar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.psymeetPrimaryBtn}>
                    <Text style={styles.psymeetPrimaryBtnText}>Agendar Agora</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    ), [themeColors]);

    const InlineCard = ({ item }) => (
        <View style={styles.proCard}>
            <View style={styles.proCardHeader}>
                <View style={[styles.proAvatarContainer, { backgroundColor: item.avatarColor || themeColors.primary.main }]}>
                    <Text style={styles.proAvatarText}>{item.initials}</Text>
                    {item.isVerified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark" size={10} color="#FFF" />
                        </View>
                    )}
                </View>
                <View style={styles.proHeaderInfo}>
                    <Text style={styles.proName}>{item.name}</Text>
                    <Text style={styles.proTitle}>{item.title}</Text>
                    <Text style={styles.proCRP}>{item.crp}</Text>
                </View>
            </View>

            <View style={styles.proTags}>
                {item.tags.slice(0, 2).map((tag, idx) => (
                    <View key={idx} style={styles.proTag}><Text style={styles.proTagText}>{tag}</Text></View>
                ))}
            </View>

            <View style={styles.proFooter}>
                <View>
                    <Text style={styles.proPriceLabel}>Sessão a partir de</Text>
                    <Text style={styles.proPrice}>R$ {item.price}</Text>
                </View>
                <TouchableOpacity style={styles.proActionBtn} onPress={() => Alert.alert('Perfil', 'Abrir perfil completo')}>
                    <Text style={styles.proActionBtnText}>Ver Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.directorySection}>
            <View style={styles.searchHero}>
                <Text style={styles.searchHeroTitle}>Encontre o especialista ideal</Text>
                <Text style={styles.searchHeroSubtitle}>Conecte-se com profissionais verificados</Text>

                <TouchableOpacity style={styles.searchBox} onPress={() => setShowModal(true)}>
                    <Ionicons name="search" size={20} color={themeColors.text.muted} />
                    <Text style={styles.searchPlaceholder}>Buscar por especialidade, nome...</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.professionalScroll}>
                {professionalsData.slice(0, 3).map(item => (
                    <InlineCard key={item.id} item={item} />
                ))}

                <TouchableOpacity style={styles.viewMoreCard} onPress={() => setShowModal(true)}>
                    <View style={styles.viewMoreIcon}>
                        <Ionicons name="search" size={24} color={themeColors.primary.main} />
                    </View>
                    <Text style={styles.viewMoreText}>Ver todos os profissionais</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal de Profissionais (Full Screen) */}
            <Modal
                visible={showModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalContainerFull}>
                    <View style={styles.modalHeaderFull}>
                        <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalBackBtn}>
                            <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitleFull}>Especialistas</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <View style={styles.modalSearchContainer}>
                        <View style={styles.searchBoxModal}>
                            <Ionicons name="search" size={20} color={themeColors.text.muted} />
                            <TextInput
                                placeholder="Buscar por nome, especialidade..."
                                placeholderTextColor={themeColors.text.muted}
                                style={styles.searchInput}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                            {FILTERS.map((f) => (
                                <TouchableOpacity
                                    key={f}
                                    style={[
                                        styles.filterChip,
                                        isActiveFilter(f) && { backgroundColor: themeColors.primary.main, borderColor: themeColors.primary.main }
                                    ]}
                                    onPress={() => handleFilterSelect(f)}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        isActiveFilter(f) && { color: '#FFF' }
                                    ]}>{f}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <FlatList
                        data={filteredProfessionals}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.professionalListContent}
                        renderItem={renderProfessionalCard}
                        initialNumToRender={5}
                        windowSize={5}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 40 }}>
                                <Ionicons name="search-outline" size={48} color={themeColors.text.muted} />
                                <Text style={{ color: themeColors.text.secondary, marginTop: 10 }}>Nenhum profissional encontrado</Text>
                            </View>
                        }
                    />
                </View>
            </Modal>
        </View>
    );
}

const getStyles = (themeColors) => StyleSheet.create({
    directorySection: {
        marginBottom: spacing.xxl,
    },
    searchHero: {
        marginBottom: spacing.lg,
    },
    searchHeroTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: themeColors.text.primary,
        marginBottom: 4,
    },
    searchHeroSubtitle: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        marginBottom: spacing.md,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        paddingHorizontal: spacing.md,
        height: 48,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: themeColors.border,
        ...shadows.sm,
    },
    searchPlaceholder: {
        marginLeft: spacing.sm,
        color: themeColors.text.muted,
        flex: 1,
    },
    professionalScroll: {
        paddingRight: spacing.lg,
        gap: spacing.md,
    },
    proCard: {
        width: 250,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: themeColors.surface,
        borderWidth: 1,
        borderColor: themeColors.border,
        marginRight: spacing.md,
        ...shadows.sm,
    },
    proCardHeader: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    proAvatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: themeColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
        position: 'relative',
    },
    proAvatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#34A853',
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    proHeaderInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    proName: {
        fontWeight: 'bold',
        fontSize: 14,
        color: themeColors.text.primary,
    },
    proTitle: {
        fontSize: 12,
        color: themeColors.text.secondary,
    },
    proCRP: {
        fontSize: 10,
        color: themeColors.text.muted,
        marginTop: 2,
    },
    proTags: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: spacing.md,
    },
    proTag: {
        backgroundColor: themeColors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    proTagText: {
        fontSize: 10,
        color: themeColors.text.secondary,
    },
    proFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: themeColors.border,
        paddingTop: spacing.sm,
    },
    proPriceLabel: {
        fontSize: 10,
        color: themeColors.text.muted,
    },
    proPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: themeColors.primary.main,
    },
    proActionBtn: {
        backgroundColor: themeColors.primary.light + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
    },
    proActionBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: themeColors.primary.main,
    },
    viewMoreCard: {
        width: 120,
        backgroundColor: themeColors.background,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderStyle: 'dashed',
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    viewMoreIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: themeColors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    viewMoreText: {
        fontSize: 12,
        fontWeight: '500',
        color: themeColors.text.secondary,
        textAlign: 'center',
    },
    // Modal Styles
    modalContainerFull: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    modalHeaderFull: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
        marginTop: 10,
    },
    modalBackBtn: {
        padding: 4,
    },
    modalTitleFull: {
        fontSize: 18,
        fontWeight: 'bold',
        color: themeColors.text.primary,
    },
    modalSearchContainer: {
        padding: spacing.md,
        backgroundColor: themeColors.surface,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
    },
    searchBoxModal: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.background,
        paddingHorizontal: spacing.md,
        height: 48,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: themeColors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        color: themeColors.text.primary,
        height: '100%',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: themeColors.background,
        borderWidth: 1,
        borderColor: themeColors.border,
        marginRight: 8,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: themeColors.text.secondary,
    },
    professionalListContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl * 3, // For scrolling space at bottom
    },
    // PsyMeet Card Styles
    psymeetCard: {
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: themeColors.border,
        ...shadows.sm,
    },
    psymeetCardHeader: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    psymeetAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E0E0E0',
    },
    psymeetInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    psymeetNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    psymeetName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: themeColors.text.primary,
    },
    psymeetTitle: {
        fontSize: 13,
        color: themeColors.text.secondary,
        marginTop: 2,
    },
    psymeetRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    psymeetRatingText: {
        fontSize: 12,
        color: themeColors.text.muted,
        fontWeight: '500',
    },
    psymeetPriceBadge: {
        alignItems: 'flex-end',
    },
    psymeetPriceLabel: {
        fontSize: 11,
        color: themeColors.text.muted,
    },
    psymeetPriceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: themeColors.success,
    },
    psymeetBody: {
        marginBottom: spacing.md,
    },
    psymeetBio: {
        fontSize: 13,
        color: themeColors.text.secondary,
        lineHeight: 18,
        marginBottom: spacing.sm,
    },
    psymeetTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    psymeetTag: {
        backgroundColor: themeColors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: themeColors.border,
    },
    psymeetTagText: {
        fontSize: 11,
        color: themeColors.text.secondary,
    },
    psymeetFooter: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    psymeetOutlineBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: themeColors.primary.main,
        alignItems: 'center',
    },
    psymeetOutlineBtnText: {
        color: themeColors.primary.main,
        fontWeight: '600',
        fontSize: 14,
    },
    psymeetPrimaryBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: borderRadius.md,
        backgroundColor: themeColors.primary.main,
        alignItems: 'center',
    },
    psymeetPrimaryBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
});
