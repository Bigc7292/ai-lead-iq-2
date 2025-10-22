import React from 'react';

export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    {props.children}
  </svg>
);

export const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <defs>
      <linearGradient id="gradDashboard" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2z" stroke="url(#gradDashboard)" />
  </Icon>
);

export const LeadsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <defs>
      <linearGradient id="gradLeads" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#22D3EE" />
      </linearGradient>
    </defs>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="url(#gradLeads)" />
  </Icon>
);

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <defs>
      <linearGradient id="gradSettings" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9CA3AF" />
        <stop offset="100%" stopColor="#E5E7EB" />
      </linearGradient>
    </defs>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="url(#gradSettings)" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="url(#gradSettings)" />
  </Icon>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <defs>
      <linearGradient id="gradSparkles" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414l-2.293 2.293m0-4.707l-2.293 2.293a1 1 0 000 1.414l2.293 2.293m-3.143-4.293l-2.293 2.293a1 1 0 01-1.414 0l-2.293-2.293a1 1 0 010-1.414l2.293-2.293a1 1 0 011.414 0l2.293 2.293zm9.143 4.293l-2.293 2.293a1 1 0 01-1.414 0l-2.293-2.293a1 1 0 010-1.414l2.293-2.293a1 1 0 011.414 0l2.293 2.293a1 1 0 010 1.414z" stroke="url(#gradSparkles)" />
  </Icon>
);

export const CampaignsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <defs>
            <linearGradient id="gradCampaigns" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#A3E635" />
            </linearGradient>
        </defs>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="url(#gradCampaigns)" />
    </Icon>
);

export const CallLogsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <defs>
            <linearGradient id="gradCallLogs" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
        </defs>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="url(#gradCallLogs)" />
    </Icon>
);

export const WorkflowsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <defs>
            <linearGradient id="gradWorkflows" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
        </defs>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="url(#gradWorkflows)" />
    </Icon>
);

export const DocumentsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <defs>
            <linearGradient id="gradDocuments" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9CA3AF" />
                <stop offset="100%" stopColor="#E5E7EB" />
            </linearGradient>
        </defs>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="url(#gradDocuments)" />
    </Icon>
);

export const TeamIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <defs>
            <linearGradient id="gradTeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#A3E635" />
            </linearGradient>
        </defs>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1-3.72a4 4 0 00-3-1.28M15 21V9.23" stroke="url(#gradTeam)" />
    </Icon>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </Icon>
);

export const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <defs>
            <linearGradient id="gradShield" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
        </defs>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 2.5 9-2.5a12.02 12.02 0 00-2.382-9.971z" stroke="url(#gradShield)" />
    </Icon>
);

export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </Icon>
);

export const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </Icon>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </Icon>
);

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </Icon>
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </Icon>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </Icon>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </Icon>
);

export const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </Icon>
);

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </Icon>
);

export const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </Icon>
);

export const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </Icon>
);

export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} viewBox="0 0 24 24" fill="currentColor" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Icon>
);

export const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} viewBox="0 0 24 24" fill="currentColor" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Icon>
);

export const AlertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </Icon>
);
export const BranchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l-4 4 2.076-5.19A5.002 5.002 0 0115 9" />
    </Icon>
);
export const MessageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </Icon>
);
export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
    </Icon>
);
export const TriggerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </Icon>
);
export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Icon>
);
export const ClipboardListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </Icon>
);
export const SocialMediaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </Icon>
);
export const ZoomInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
  </Icon>
);
export const ZoomOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
  </Icon>
);
export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Icon>
);
export const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V3a2 2 0 012-2h2z" />
  </Icon>
);
export const WebhookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.75 11a2.25 2.25 0 012.25 2.25M16.25 11a2.25 2.25 0 00-2.25 2.25m0 0V15m0-1.75a2.25 2.25 0 01-2.25-2.25M12 15V-1.055M12 15v2.055" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
  </Icon>
);

export const ThumbsUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-1.9 3.8a2 2 0 01-.503.633L2 12v8h5" />
  </Icon>
);

export const ThumbsDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.79-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085a2 2 0 001.736-.97l1.9-3.8a2 2 0 01.504-.634L22 12V4h-5" />
  </Icon>
);

export const PhoneWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <defs>
            <linearGradient id="gradLive" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
        </defs>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 17.657a5 5 0 01-7.071 0m7.071 0a5 5 0 00-7.071 0M17.657 17.657L12 22.222m5.657-4.565a9 9 0 01-12.728 0m12.728 0a9 9 0 00-12.728 0m12.728 0l-5.657 5.657M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="url(#gradLive)" />
    </Icon>
);

export const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </Icon>
);

export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} fill="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
  </Icon>
);

export const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <defs>
            <linearGradient id="gradPlaybook" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
        </defs>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="url(#gradPlaybook)" />
    </Icon>
);