import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {Bot, X, Send, Sparkles, MapPin, IndianRupee, Home} from 'lucide-react-native';
import {useAgentChat} from '../../hooks/useAgentChat';
import {
  extractSeoSlug,
  getDisplayText,
} from '../../utils/agentChatUtils';
import {getImageUri} from '../../utils/imageHandle';

const QUICK_PROMPTS = [
  '2 BHK in Pune under 90L',
  'Properties in Nagpur',
  'Schedule a site visit',
  'Talk to sales team',
];

const PROMPT_MAP = {
  '2 BHK in Pune under 90L': 'Show me 2 BHK apartments in Pune under 90 lakh',
  'Properties in Nagpur': 'What properties do you have in Nagpur?',
  'Schedule a site visit': 'I want to schedule a site visit next Saturday',
  'Talk to sales team': 'Connect me with a sales executive',
};

function TypingIndicator() {
  return (
    <View style={styles.typingBubble}>
      <View style={styles.typingDots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={styles.typingDot} />
        ))}
      </View>
    </View>
  );
}

function PropertyCard({property, onPress}) {
  const imageUri = getImageUri(property.imageUrl);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.propertyCard}>
      {imageUri ? (
        <Image source={{uri: imageUri}} style={styles.propertyImage} />
      ) : (
        <View style={styles.propertyImagePlaceholder}>
          <Home size={20} color="rgba(138,56,245,0.5)" />
        </View>
      )}
      <View style={styles.propertyBody}>
        <Text style={styles.propertyName} numberOfLines={2}>
          {property.projectName || 'Property'}
        </Text>
        {property.location ? (
          <View style={styles.propertyLocationRow}>
            <MapPin size={10} color="#868686" />
            <Text style={styles.propertyLocation} numberOfLines={2}>
              {property.location}
            </Text>
          </View>
        ) : null}
        {property.bedrooms ? (
          <Text style={styles.propertyBedrooms} numberOfLines={1}>
            {property.bedrooms}
          </Text>
        ) : null}
        <View style={styles.propertyPriceRow}>
          <IndianRupee size={11} color="#5E23DC" />
          <Text style={styles.propertyPrice}>
            {property.price || 'Price on request'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ChatMessage({message, onPropertyPress}) {
  if (message.role === 'error') {
    return (
      <View style={styles.errorBubble}>
        <Text style={styles.errorText}>{message.text}</Text>
      </View>
    );
  }

  const isUser = message.role === 'user';
  const displayText = isUser
    ? message.text
    : getDisplayText(message.text, message.properties);

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowBot,
      ]}>
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}>
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText,
          ]}>
          {displayText}
        </Text>
      </View>
      {message.properties?.length > 0 ? (
        <View style={styles.propertiesSection}>
          <Text style={styles.propertiesLabel}>
            {message.properties.length} Properties found
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertiesRow}>
            {message.properties.map((property, index) => {
              const seoSlug = extractSeoSlug(property);
              return (
                <PropertyCard
                  key={`${property.projectName}-${index}`}
                  property={property}
                  onPress={() => {
                    if (seoSlug) {
                      onPropertyPress(seoSlug);
                    }
                  }}
                />
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export default function AgentWidget() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {height: windowHeight} = useWindowDimensions();
  const {user, token} = useSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const {
    connectionStatus,
    messages,
    isTyping,
    isSending,
    isLoadingHistory,
    sendMessage,
  } = useAgentChat(user, token, isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({animated: true});
    }, 80);
    return () => clearTimeout(timer);
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (sendMessage(input)) {
      setInput('');
    }
  };

  const handlePrompt = label => {
    sendMessage(PROMPT_MAP[label] || label);
  };

  const handlePropertyPress = seoSlug => {
    setIsOpen(false);
    navigation.navigate('PropertyDetails', {seoSlug});
  };

  const isOnline = connectionStatus === 'connected';
  const canSend = Boolean(input.trim()) && !isSending;
  const panelHeight = Math.min(windowHeight * 0.78, 640);

  return (
    <>
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
          pointerEvents="box-none">
          <View
            style={[
              styles.panel,
              {
                height: panelHeight,
                paddingBottom: Math.max(insets.bottom, 8),
              },
            ]}>
            <LinearGradient
              colors={['#5308e7', '#5E23DC', '#8A38F5']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.header}>
              <View style={styles.headerIconWrap}>
                <Sparkles size={18} color="#fff" />
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.headerTitle}>Reparv AI Advisor</Text>
                <Text style={styles.headerSubtitle}>
                  Properties · Budget · Site visits
                </Text>
              </View>
              <View style={styles.headerActions}>
                <View style={styles.statusPill}>
                  <View
                    style={[
                      styles.statusDot,
                      isOnline ? styles.statusDotOnline : styles.statusDotPending,
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {isOnline ? 'Online' : 'Connecting'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  style={styles.closeBtn}
                  hitSlop={8}>
                  <X size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView
              ref={scrollRef}
              style={styles.messages}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({animated: true})
              }>
              {isLoadingHistory ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color="#8A38F5" />
                  <Text style={styles.loadingText}>Loading your chat…</Text>
                </View>
              ) : (
                messages.map(msg => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onPropertyPress={handlePropertyPress}
                  />
                ))
              )}
              {isTyping ? <TypingIndicator /> : null}
            </ScrollView>

            <View style={styles.promptsSection}>
              <Text style={styles.promptsLabel}>Quick asks</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promptsRow}>
                {QUICK_PROMPTS.map(label => (
                  <TouchableOpacity
                    key={label}
                    style={styles.promptChip}
                    disabled={isSending}
                    onPress={() => handlePrompt(label)}>
                    <Text style={styles.promptChipText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                value={input}
                onChangeText={setInput}
                placeholder="Ask about properties…"
                placeholderTextColor="#868686"
                editable={!isSending}
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSend}
                style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}>
                <LinearGradient
                  colors={['#5E23DC', '#8A38F5']}
                  style={styles.sendBtnGradient}>
                  <Send size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {!isOpen ? (
        <View
          pointerEvents="box-none"
          style={[styles.launcherWrap, {bottom: 76 + insets.bottom}]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsOpen(true)}
            style={styles.launcherBtn}
            accessibilityLabel="Open AI advisor">
            <LinearGradient
              colors={['#5308e7', '#5E23DC', '#8A38F5']}
              style={styles.launcherGradient}>
              <Bot size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.launcherBadge} />
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(83,8,231,0.12)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotOnline: {
    backgroundColor: '#6ee7b7',
  },
  statusDotPending: {
    backgroundColor: '#fcd34d',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  messagesContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  loadingText: {
    color: '#868686',
    fontSize: 12,
  },
  messageRow: {
    width: '100%',
    gap: 8,
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageRowBot: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '90%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#5E23DC',
    borderBottomRightRadius: 6,
  },
  botBubble: {
    backgroundColor: '#faf8ff',
    borderWidth: 1,
    borderColor: 'rgba(83,8,231,0.12)',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#1b1b20',
  },
  errorBubble: {
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  propertiesSection: {
    width: '100%',
  },
  propertiesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#868686',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  propertiesRow: {
    gap: 10,
    paddingRight: 8,
  },
  propertyCard: {
    width: 168,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(83,8,231,0.22)',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 96,
    backgroundColor: '#f6f2fa',
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f2fa',
  },
  propertyBody: {
    padding: 10,
    gap: 4,
  },
  propertyName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1b1b20',
    minHeight: 32,
  },
  propertyLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  propertyLocation: {
    flex: 1,
    fontSize: 11,
    color: '#868686',
  },
  propertyBedrooms: {
    fontSize: 11,
    color: '#484456',
  },
  propertyPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  propertyPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E23DC',
  },
  typingBubble: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(83,8,231,0.12)',
    backgroundColor: '#faf8ff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 5,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8A38F5',
    opacity: 0.7,
  },
  promptsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(83,8,231,0.08)',
    backgroundColor: '#fafafa',
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 14,
  },
  promptsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#868686',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  promptsRow: {
    gap: 8,
    paddingRight: 8,
  },
  promptChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(83,8,231,0.18)',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  promptChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5E23DC',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(83,8,231,0.08)',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 13,
    color: '#1b1b20',
  },
  sendBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launcherWrap: {
    position: 'absolute',
    right: 16,
    zIndex: 50,
  },
  launcherBtn: {
    position: 'relative',
  },
  launcherGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5E23DC',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  launcherBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34d399',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
