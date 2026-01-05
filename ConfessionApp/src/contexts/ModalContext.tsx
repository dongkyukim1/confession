/**
 * 모달 전역 관리 Context
 * 
 * 어디서든 모달을 호출할 수 있도록 전역 상태로 관리
 * 모달 큐 시스템으로 여러 모달을 순차적으로 처리
 */
import React, {createContext, useContext, useState, ReactNode, useCallback} from 'react';
import CustomModal, {ModalType, ModalButton} from '../components/CustomModal';

export interface ModalConfig {
  type: ModalType;
  title: string;
  message: string;
  buttons?: ModalButton[];
  dismissable?: boolean;
  showSuccessAnimation?: boolean;
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * useModal Hook
 * 
 * 모달을 표시하기 위한 훅
 */
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

/**
 * ModalProvider
 * 
 * 앱 전체를 감싸서 모달 기능을 제공
 */
export const ModalProvider = ({children}: ModalProviderProps) => {
  const [modalQueue, setModalQueue] = useState<ModalConfig[]>([]);
  const [currentModal, setCurrentModal] = useState<ModalConfig | null>(null);
  const [visible, setVisible] = useState(false);

  /**
   * 모달 표시
   */
  const showModal = useCallback((config: ModalConfig) => {
    if (currentModal) {
      // 이미 모달이 표시 중이면 큐에 추가
      setModalQueue(prev => [...prev, config]);
    } else {
      // 바로 표시
      setCurrentModal(config);
      setVisible(true);
    }
  }, [currentModal]);

  /**
   * 모달 숨김
   */
  const hideModal = useCallback(() => {
    setVisible(false);
    
    // 애니메이션 완료 후 다음 모달 표시
    setTimeout(() => {
      setCurrentModal(null);
      
      // 큐에 다음 모달이 있으면 표시
      if (modalQueue.length > 0) {
        const nextModal = modalQueue[0];
        setModalQueue(prev => prev.slice(1));
        setCurrentModal(nextModal);
        setVisible(true);
      }
    }, 300);
  }, [modalQueue]);

  /**
   * 모달이 닫힐 때 처리
   */
  const handleDismiss = useCallback(() => {
    hideModal();
  }, [hideModal]);

  return (
    <ModalContext.Provider value={{showModal, hideModal}}>
      {children}
      {currentModal && (
        <CustomModal
          visible={visible}
          type={currentModal.type}
          title={currentModal.title}
          message={currentModal.message}
          buttons={currentModal.buttons}
          dismissable={currentModal.dismissable}
          showSuccessAnimation={currentModal.showSuccessAnimation}
          onDismiss={handleDismiss}
        />
      )}
    </ModalContext.Provider>
  );
};

/**
 * 편의 함수들
 */

/**
 * 정보 모달 표시
 */
export const showInfoModal = (
  showModal: (config: ModalConfig) => void,
  title: string,
  message: string,
  buttons?: ModalButton[],
) => {
  showModal({
    type: 'info',
    title,
    message,
    buttons: buttons || [{text: '확인', style: 'default'}],
    dismissable: true,
  });
};

/**
 * 성공 모달 표시
 */
export const showSuccessModal = (
  showModal: (config: ModalConfig) => void,
  title: string,
  message: string,
  showAnimation = true,
  buttons?: ModalButton[],
) => {
  showModal({
    type: 'success',
    title,
    message,
    buttons: buttons || [{text: '확인', style: 'default'}],
    dismissable: true,
    showSuccessAnimation: showAnimation,
  });
};

/**
 * 경고 모달 표시
 */
export const showWarningModal = (
  showModal: (config: ModalConfig) => void,
  title: string,
  message: string,
  buttons?: ModalButton[],
) => {
  showModal({
    type: 'warning',
    title,
    message,
    buttons: buttons || [{text: '확인', style: 'default'}],
    dismissable: true,
  });
};

/**
 * 에러 모달 표시
 */
export const showErrorModal = (
  showModal: (config: ModalConfig) => void,
  title: string,
  message: string,
  buttons?: ModalButton[],
) => {
  showModal({
    type: 'error',
    title,
    message,
    buttons: buttons || [{text: '확인', style: 'default'}],
    dismissable: true,
  });
};

/**
 * 확인 모달 표시 (취소/확인 2개 버튼)
 */
export const showConfirmModal = (
  showModal: (config: ModalConfig) => void,
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText = '확인',
  cancelText = '취소',
) => {
  showModal({
    type: 'info',
    title,
    message,
    buttons: [
      {text: cancelText, style: 'cancel', onPress: onCancel},
      {text: confirmText, style: 'default', onPress: onConfirm},
    ],
    dismissable: true,
  });
};

/**
 * 파괴적 액션 확인 모달 (삭제 등)
 */
export const showDestructiveModal = (
  showModal: (config: ModalConfig) => void,
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText = '삭제',
  cancelText = '취소',
) => {
  showModal({
    type: 'warning',
    title,
    message,
    buttons: [
      {text: cancelText, style: 'cancel', onPress: onCancel},
      {text: confirmText, style: 'destructive', onPress: onConfirm},
    ],
    dismissable: true,
  });
};



