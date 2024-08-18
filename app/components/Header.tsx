import Link from 'next/link';

const Header = () => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          <li>
            <Link href="/verify">
              <a>Verify</a>
            </Link>
          </li>
          <li>
            <Link href="/auth">
              <a>Auth</a>
            </Link>
          </li>
          <li>
            <Link href="/bounties">
              <a>Bounties</a>
            </Link>
          </li>
          <li>
            <Link href="/bounty-approval">
              <a>Bounty Approval</a>
            </Link>
          </li>
          <li>
            <Link href="/profile">
              <a>Profile</a>
            </Link>
          </li>
          <li>
            <Link href="/leaderboard">
              <a>Leaderboard</a>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;