import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { withTimeout, getUserFacingError } from './lib/resilience';
import { ensureProfile } from './lib/userData';
import './features.css';
import { TopicSearch, TopicStudy } from './features/TopicSearch';
import { VerseStudy } from './features/VerseStudy';

// Existing application code remains unchanged except for resilient requests below.
